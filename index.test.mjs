import test from "node:test";
import assert from "node:assert/strict";
import worker from "./index.js";

const ORIGIN = "https://kamenriderspider1-coder.github.io";

async function call(path, options = {}) {
  return worker.fetch(new Request("https://unit.test" + path, options), {});
}

// Replaces global fetch for one test. The handler receives the request URL string.
async function withMockedFetch(handler, run) {
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => handler(String(input?.url ?? input), init);
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

const ZIP_BYTES = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00]);

test("health endpoint reports the cloud API and its honest capability boundary", async () => {
  const response = await call("/api/health", { headers: { Origin: ORIGIN } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), ORIGIN);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.service, "brawl-mod-manager-cloud-api");
  assert.ok(body.capabilities.includes("creator-page-link-discovery"));
  assert.ok(body.capabilities.includes("bounded-archive-proxy"));
  assert.ok(body.notEnabled.includes("server-side-MEGA-account-access"));
});

test("catalog endpoint returns the committed catalog", async () => {
  const response = await call("/api/catalog", { headers: { Origin: ORIGIN } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  assert.ok(await response.json());
});

test("Wii-style requests without an Origin header can read the catalog", async () => {
  const response = await call("/api/catalog");
  assert.equal(response.status, 200);
});

test("unapproved browser origins are rejected", async () => {
  const response = await call("/api/health", { headers: { Origin: "https://example.com" } });
  assert.equal(response.status, 403);
});

test("unsupported methods are rejected", async () => {
  const response = await call("/api/catalog", { method: "POST", headers: { Origin: ORIGIN } });
  assert.equal(response.status, 405);
});

test("creator discovery rejects unsupported domains before fetching", async () => {
  const response = await call("/api/discover?url=" + encodeURIComponent("https://example.com/file.zip"), { headers: { Origin: ORIGIN } });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /creator pages are supported/i);
});

test("archive proxy rejects unsupported hosts before fetching", async () => {
  const response = await call("/api/archive?url=" + encodeURIComponent("https://example.com/file.zip"), { headers: { Origin: ORIGIN } });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /unsupported download host/i);
});

test("discovery rejects non-HTTPS source URLs", async () => {
  const response = await call("/api/discover?url=" + encodeURIComponent("http://gamebanana.com/mods/123"), { headers: { Origin: ORIGIN } });
  assert.equal(response.status, 400);
});

test("unknown routes return JSON 404", async () => {
  const response = await call("/api/not-real", { headers: { Origin: ORIGIN } });
  assert.equal(response.status, 404);
  assert.equal((await response.json()).ok, false);
});

test("CORS preflight is limited to the approved Pages origin", async () => {
  const response = await call("/api/catalog", {
    method: "OPTIONS",
    headers: { Origin: ORIGIN, "Access-Control-Request-Method": "GET" }
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-methods"), "GET, OPTIONS");
});

test("GameBanana discovery uses the JSON API and keeps only ZIP files", async () => {
  const seen = [];
  await withMockedFetch(
    (url) => {
      seen.push(url);
      return new Response(JSON.stringify({
        _aFiles: [
          { _sFile: "All-Stars 1.1.6.zip", _sDownloadUrl: "https://gamebanana.com/dl/111" },
          { _sFile: "readme-pack.rar", _sDownloadUrl: "https://gamebanana.com/dl/222" }
        ]
      }), { headers: { "content-type": "application/json" } });
    },
    async () => {
      const response = await call("/api/discover?url=" + encodeURIComponent("https://gamebanana.com/mods/626137"), { headers: { Origin: ORIGIN } });
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.candidates.length, 1);
      assert.equal(body.candidates[0].url, "https://gamebanana.com/dl/111");
      assert.equal(body.candidates[0].label, "All-Stars 1.1.6.zip");
    }
  );
  assert.ok(seen.some((url) => url.startsWith("https://gamebanana.com/apiv11/Mod/626137")));
});

test("HTML creator pages only yield direct .zip links, not download pages", async () => {
  const html = `
    <a href="/download/page">Download</a>
    <a href="/files/Project-Plus-Wii-Lite.zip">Wii Lite ZIP</a>
    <a href="https://example.com/evil.zip">Off-site</a>`;
  await withMockedFetch(
    () => new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } }),
    async () => {
      const response = await call("/api/discover?url=" + encodeURIComponent("https://projectplusgame.com/download"), { headers: { Origin: ORIGIN } });
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.deepEqual(body.candidates.map((c) => c.url), ["https://projectplusgame.com/files/Project-Plus-Wii-Lite.zip"]);
    }
  );
});

test("archive proxy refuses responses that are not ZIP files", async () => {
  await withMockedFetch(
    () => new Response("<html>not a zip</html>", { headers: { "content-type": "text/html" } }),
    async () => {
      const response = await call("/api/archive?url=" + encodeURIComponent("https://gamebanana.com/dl/111"), { headers: { Origin: ORIGIN } });
      assert.equal(response.status, 415);
      const body = await response.json();
      assert.match(body.error, /not a ZIP file/i);
      assert.match(body.error, /text\/html/);
    }
  );
});

test("archive proxy streams a real ZIP through unchanged", async () => {
  await withMockedFetch(
    () => new Response(ZIP_BYTES, { headers: { "content-type": "application/zip" } }),
    async () => {
      const response = await call("/api/archive?url=" + encodeURIComponent("https://gamebanana.com/dl/111"), { headers: { Origin: ORIGIN } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), "application/zip");
      const bytes = new Uint8Array(await response.arrayBuffer());
      assert.deepEqual(Array.from(bytes), Array.from(ZIP_BYTES));
    }
  );
});
