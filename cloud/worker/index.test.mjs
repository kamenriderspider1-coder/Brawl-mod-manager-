import test from "node:test";
import assert from "node:assert/strict";
import worker from "./index.js";

const ORIGIN = "https://kamenriderspider1-coder.github.io";

async function call(path, options = {}) {
  return worker.fetch(new Request("https://unit.test" + path, options), {});
}

test("health endpoint reports the cloud API and its honest capability boundary", async () => {
  const response = await call("/api/health", { headers: { Origin: ORIGIN } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), ORIGIN);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.service, "brawl-mod-manager-cloud-api");
  assert.deepEqual(body.capabilities, ["health-check", "read-only-catalog"]);
  assert.ok(body.notEnabled.includes("MEGA-account-access"));
});

test("catalog endpoint returns the committed catalog", async () => {
  const response = await call("/api/catalog", { headers: { Origin: ORIGIN } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  const body = await response.json();
  assert.ok(body);
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
