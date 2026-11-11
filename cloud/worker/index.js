const catalog = { schemaVersion: 1, lastReviewed: null, entries: [] };
const ALLOWED_ORIGINS = new Set(["https://kamenriderspider1-coder.github.io"]);
function cors(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": allowed } : {}),
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
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ ok:false, error:"Origin not allowed" }, 403, "");
    if (request.method === "OPTIONS") {
      if (!origin || !ALLOWED_ORIGINS.has(origin)) return new Response(null, { status:403 });
      return new Response(null, { status:204, headers:cors(origin) });
    }
    if (request.method !== "GET") return json({ ok:false, error:"Method not allowed" }, 405, origin);
    if (url.pathname === "/" || url.pathname === "/api/health" || url.pathname === "/health") {
      return json({
        ok:true,
        service:"brawl-mod-manager-cloud-api",
        version:"1.1.0",
        capabilities:["health-check","read-only-catalog"],
        notEnabled:["MEGA-account-access","mod-downloads","archive-extraction","Wii-file-serving","mod-installation"],
        message:"Cloud API is running. MEGA storage and Wii network delivery are not configured."
      }, 200, origin);
    }
    if (url.pathname === "/api/catalog" || url.pathname === "/catalog") return json(catalog, 200, origin);
    return json({ ok:false, error:"Route not found" }, 404, origin);
  }
};