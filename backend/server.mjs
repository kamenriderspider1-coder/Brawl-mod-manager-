import { createServer } from "node:http";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = "https://kamenriderspider1-coder.github.io";

function sendJson(response, status, body, origin) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin"
  });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  const origin = request.headers.origin;

  if (origin !== ALLOWED_ORIGIN) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Origin not allowed");
    return;
  }

  if (request.method === "OPTIONS" && request.url === "/health") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Private-Network": "true",
      "Vary": "Origin"
    });
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "brawl-mod-manager-local",
      version: "0.1.0",
      capabilities: ["health-check"],
      message: "Local backend is running. Storage and mod-processing integrations are not enabled yet."
    }, ALLOWED_ORIGIN);
    return;
  }

  sendJson(response, 404, { ok: false, error: "Route not found" }, ALLOWED_ORIGIN);
});

server.listen(PORT, HOST, () => {
  console.log(`Brawl Mod Manager local backend listening at http://${HOST}:${PORT}`);
  console.log("Keep this Terminal window open while using the GitHub Pages app.");
  console.log("Press Control+C to stop the backend.");
});

server.on("error", (error) => {
  console.error("Backend failed to start:", error.message);
  process.exitCode = 1;
});
