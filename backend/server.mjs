import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export const HOST = "127.0.0.1";
export const PORT = Number(process.env.PORT || 8787);
export const ALLOWED_ORIGIN = "https://kamenriderspider1-coder.github.io";

function sendJson(response, status, body, origin = ALLOWED_ORIGIN) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin"
  });
  response.end(JSON.stringify(body));
}

export function createHandler() {
  return (request, response) => {
    const origin = request.headers.origin;
    if (origin !== ALLOWED_ORIGIN) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      response.end("Origin not allowed");
      return;
    }

    const url = new URL(request.url || "/", `http://${HOST}`);

    if (request.method === "OPTIONS" && url.pathname === "/health") {
      const headers = {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "600",
        "Vary": "Origin"
      };
      // Chromium-based browsers may request Private Network Access permission.
      if (request.headers["access-control-request-private-network"] === "true") {
        headers["Access-Control-Allow-Private-Network"] = "true";
      }
      response.writeHead(204, headers);
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, {
        ok: true,
        service: "brawl-mod-manager-local",
        version: "0.2.0",
        capabilities: ["health-check"],
        message: "Mac backend is reachable. MEGA/Drive access, mod downloads, extraction, and Wii file serving are not enabled."
      });
      return;
    }

    sendJson(response, 404, { ok: false, error: "Route not found" });
  };
}

export function startServer() {
  const server = createServer(createHandler());
  server.listen(PORT, HOST, () => {
    console.log(`Brawl Mod Manager local backend listening at http://${HOST}:${PORT}`);
    console.log("Keep the Mac awake and connected to Wi-Fi while using the local backend.");
    console.log("Press Control+C to stop the backend.");
  });
  server.on("error", (error) => {
    console.error("Backend failed to start:", error.message);
    process.exitCode = 1;
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startServer();
}
