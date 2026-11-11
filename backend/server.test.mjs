import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createHandler, ALLOWED_ORIGIN } from "./server.mjs";

async function withServer(run) {
  const server = createServer(createHandler());
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("health endpoint returns the local service status", async () => {
  await withServer(async (base) => {
    const response = await fetch(base + "/health", { headers: { Origin: ALLOWED_ORIGIN } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), ALLOWED_ORIGIN);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.deepEqual(body.capabilities, ["health-check"]);
  });
});

test("requests from other origins are rejected", async () => {
  await withServer(async (base) => {
    const response = await fetch(base + "/health", { headers: { Origin: "https://example.com" } });
    assert.equal(response.status, 403);
  });
});

test("unknown routes return JSON 404", async () => {
  await withServer(async (base) => {
    const response = await fetch(base + "/not-a-route", { headers: { Origin: ALLOWED_ORIGIN } });
    assert.equal(response.status, 404);
    assert.equal((await response.json()).ok, false);
  });
});

test("private-network preflight is answered when the browser requests it", async () => {
  await withServer(async (base) => {
    const response = await fetch(base + "/health", {
      method: "OPTIONS",
      headers: {
        Origin: ALLOWED_ORIGIN,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Private-Network": "true"
      }
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-private-network"), "true");
  });
});
