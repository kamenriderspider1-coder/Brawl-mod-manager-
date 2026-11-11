const catalog = { schemaVersion: 1, lastReviewed: null, entries: [] };

const ORIGINS = new Set(["https://kamenriderspider1-coder.github.io"]);
const HOSTS = new Set([
  "gamebanana.com",
  "www.gamebanana.com",
  "files.gamebanana.com",
  "projectplusgame.com",
  "www.projectplusgame.com"
]);
const MAX_PAGE = 2 * 1024 * 1024;
const MAX_FILE = 100 * 1024 * 1024;
const USER_AGENT = "BrawlModManager/1.0";
const ZIP_SIGNATURES = [
  [0x50, 0x4b, 0x03, 0x04], // local file header
  [0x50, 0x4b, 0x05, 0x06], // empty archive
  [0x50, 0x4b, 0x07, 0x08]  // spanned archive marker
];

function cors(origin) {
  return {
    ...(ORIGINS.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin"
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...cors(origin)
    }
  });
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && HOSTS.has(url.hostname.toLowerCase()) ? url : null;
  } catch {
    return null;
  }
}

function concat(chunks) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

async function readText(response, limit) {
  if (Number(response.headers.get("content-length") || 0) > limit) {
    throw new Error("Page exceeds 2 MB scan limit.");
  }
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        throw new Error("Page exceeds 2 MB scan limit.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new TextDecoder().decode(concat(chunks));
}

// Only direct .zip links count as candidates. Other links were often download pages, not files.
function scanZipLinks(html, base) {
  const found = [];
  const seen = new Set();
  const pattern = /<a\b[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi;
  let match;
  while ((match = pattern.exec(html)) && found.length < 20) {
    const raw = (match[1] || match[2] || match[3] || "").replace(/&amp;/g, "&").trim();
    const label = (match[4] || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    let url;
    try {
      url = new URL(raw, base);
    } catch {
      continue;
    }
    if (!safeUrl(url.href) || seen.has(url.href)) continue;
    if (!/\.zip$/i.test(url.pathname)) continue;
    seen.add(url.href);
    found.push({ url: url.href, label: label || url.pathname.split("/").pop(), host: url.hostname });
  }
  return found;
}

// GameBanana mod pages are rendered by JavaScript, so their HTML has no download links.
// The same data is available from GameBanana's public JSON API.
async function discoverGameBanana(modId, pageUrl) {
  const api = `https://gamebanana.com/apiv11/Mod/${modId}?_csvProperties=_aFiles`;
  const response = await fetch(api, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) return { error: "GameBanana returned HTTP " + response.status };
  const data = await response.json();
  const candidates = [];
  for (const file of Array.isArray(data._aFiles) ? data._aFiles : []) {
    const name = typeof file._sFile === "string" ? file._sFile : "";
    if (name && !/\.zip$/i.test(name)) continue; // this import path handles ZIP files only
    const url = safeUrl(file._sDownloadUrl || "");
    if (!url) continue;
    candidates.push({ url: url.href, label: name || "Download archive", host: url.hostname });
    if (candidates.length >= 20) break;
  }
  return { source: pageUrl.href, candidates };
}

async function discover(raw) {
  const url = safeUrl(raw);
  if (!url) return { error: "Only HTTPS GameBanana and Project+ creator pages are supported." };

  const gameBanana = url.hostname.replace(/^www\./, "") === "gamebanana.com"
    ? url.pathname.match(/^\/mods\/(\d+)/)
    : null;
  if (gameBanana) return discoverGameBanana(gameBanana[1], url);

  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15000)
  });
  const final = safeUrl(response.url || url.href);
  if (!final) return { error: "Creator page redirected outside supported domains." };
  if (!response.ok) return { error: "Creator page returned HTTP " + response.status };
  if (!/text\/html|application\/xhtml\+xml/i.test(response.headers.get("content-type") || "")) {
    return { error: "Source did not return HTML." };
  }
  return { source: final.href, candidates: scanZipLinks(await readText(response, MAX_PAGE), final.href) };
}

function looksLikeZip(head) {
  return ZIP_SIGNATURES.some((signature) => signature.every((byte, i) => head[i] === byte));
}

// Reads chunks until `count` bytes are available. Returns the chunks read so they can be replayed.
async function readHead(reader, count) {
  const chunks = [];
  let size = 0;
  while (size < count) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  return { chunks, head: concat(chunks).subarray(0, count) };
}

async function download(raw, origin) {
  const url = safeUrl(raw);
  if (!url) return json({ ok: false, error: "Unsupported download host." }, 400, origin);

  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "application/zip,application/octet-stream,*/*", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(60000)
  });
  if (!safeUrl(response.url || url.href)) {
    return json({ ok: false, error: "Download redirected outside supported domains." }, 403, origin);
  }
  if (!response.ok || !response.body) {
    return json({ ok: false, error: "Download returned HTTP " + response.status }, 502, origin);
  }
  if (Number(response.headers.get("content-length") || 0) > MAX_FILE) {
    return json({ ok: false, error: "Archive exceeds 100 MB." }, 413, origin);
  }

  const reader = response.body.getReader();
  const { chunks, head } = await readHead(reader, 4);
  if (!looksLikeZip(head)) {
    await reader.cancel();
    const type = response.headers.get("content-type") || "an unknown type";
    return json({
      ok: false,
      error: `This link returned ${type}, not a ZIP file. Pick a different detected link, or download the ZIP in your browser and use the manual ZIP option.`
    }, 415, origin);
  }

  let total = 0;
  const pending = [...chunks];
  const body = new ReadableStream({
    async pull(controller) {
      try {
        let value;
        if (pending.length) {
          value = pending.shift();
        } else {
          const next = await reader.read();
          if (next.done) {
            controller.close();
            return;
          }
          value = next.value;
        }
        total += value.byteLength;
        if (total > MAX_FILE) {
          await reader.cancel();
          controller.error(new Error("Archive exceeds 100 MB."));
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      return reader.cancel();
    }
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="creator-mod.zip"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...cors(origin)
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (origin && !ORIGINS.has(origin)) return json({ ok: false, error: "Origin not allowed" }, 403, "");
    if (request.method === "OPTIONS") {
      return origin ? new Response(null, { status: 204, headers: cors(origin) }) : new Response(null, { status: 403 });
    }
    if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405, origin);

    if (["/", "/health", "/api/health"].includes(url.pathname)) {
      return json({
        ok: true,
        service: "brawl-mod-manager-cloud-api",
        version: "1.3.0",
        capabilities: ["health-check", "read-only-catalog", "creator-page-link-discovery", "bounded-archive-proxy"],
        notEnabled: ["server-side-MEGA-account-access", "background-jobs", "Wii-file-serving", "mod-installation"]
      }, 200, origin);
    }

    if (["/catalog", "/api/catalog"].includes(url.pathname)) return json(catalog, 200, origin);

    if (url.pathname === "/api/discover") {
      try {
        const result = await discover(url.searchParams.get("url") || "");
        return result.error
          ? json({ ok: false, error: result.error }, 400, origin)
          : json({ ok: true, ...result }, 200, origin);
      } catch (error) {
        return json({ ok: false, error: error.message || "Scan failed" }, 502, origin);
      }
    }

    if (url.pathname === "/api/archive") {
      try {
        return await download(url.searchParams.get("url") || "", origin);
      } catch (error) {
        return json({ ok: false, error: error.message || "Download failed" }, 502, origin);
      }
    }

    return json({ ok: false, error: "Route not found" }, 404, origin);
  }
};
