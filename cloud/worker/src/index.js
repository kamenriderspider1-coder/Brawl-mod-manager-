const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, HEAD, PUT, OPTIONS",
  "access-control-allow-headers": "content-type, x-admin-token, range"
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...JSON_HEADERS, ...extra }
  });
}

function validKey(key) {
  return typeof key === "string" &&
    key.length > 0 && key.length <= 512 &&
    !key.startsWith("/") &&
    !key.includes("\\") &&
    !key.split("/").some(part => !part || part === "." || part === "..") &&
    /^[a-zA-Z0-9._/-]+$/.test(key);
}

function authorized(request, env) {
  const expected = env.ADMIN_TOKEN;
  const supplied = request.headers.get("x-admin-token") || "";
  return typeof expected === "string" && expected.length >= 24 && supplied === expected;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/" || path === "/health") {
      return json({
        service: "Brawl Mod Cloud",
        status: "online",
        api: "v1",
        storage: "Cloudflare R2",
        note: "This HTTP API is not a Riivolution RiiFS server."
      });
    }

    if (path === "/v1/catalog" && (request.method === "GET" || request.method === "HEAD")) {
      const object = await env.BRAWL_MODS.get("catalog.json");
      if (!object) return json({ schemaVersion: 1, entries: [] });
      const headers = new Headers(JSON_HEADERS);
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=30");
      if (request.method === "HEAD") return new Response(null, { headers });
      return new Response(object.body, { headers });
    }

    if (path.startsWith("/v1/mods/") && (request.method === "GET" || request.method === "HEAD")) {
      const key = decodeURIComponent(path.slice("/v1/mods/".length));
      if (!validKey(key) || key === "catalog.json") return json({ error: "Invalid object key" }, 400);
      const object = await env.BRAWL_MODS.get("mods/" + key);
      if (!object) return json({ error: "Mod not found" }, 404);
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("access-control-allow-origin", "*");
      headers.set("accept-ranges", "none");
      if (request.method === "HEAD") return new Response(null, { headers });
      return new Response(object.body, { headers });
    }

    if (path.startsWith("/v1/admin/objects/") && request.method === "PUT") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      const key = decodeURIComponent(path.slice("/v1/admin/objects/".length));
      if (!validKey(key)) return json({ error: "Invalid object key" }, 400);
      if (key === "catalog.json" || key.startsWith("mods/")) {
        return json({ error: "Use a key beneath the mods/ namespace; catalog.json is managed separately." }, 400);
      }
      const contentType = request.headers.get("content-type") || "application/octet-stream";
      await env.BRAWL_MODS.put("mods/" + key, request.body, {
        httpMetadata: { contentType },
        customMetadata: { uploadedBy: "brawl-mod-cloud-admin" }
      });
      return json({ ok: true, key: "mods/" + key });
    }

    if (path === "/v1/admin/catalog" && request.method === "PUT") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      let catalog;
      try { catalog = await request.json(); }
      catch { return json({ error: "Body must be valid JSON" }, 400); }
      if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.entries)) {
        return json({ error: "Expected schemaVersion: 1 and an entries array" }, 400);
      }
      await env.BRAWL_MODS.put("catalog.json", JSON.stringify(catalog, null, 2), {
        httpMetadata: { contentType: "application/json; charset=utf-8" }
      });
      return json({ ok: true, entries: catalog.entries.length });
    }

    return json({ error: "Not found" }, 404);
  }
};
