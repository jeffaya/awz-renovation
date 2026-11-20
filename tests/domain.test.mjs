import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../worker.mjs";

const origin = "https://awz-renovation.com";

test("old Worker links redirect permanently to the same path and query on the production domain", () => {
  for (const path of [
    "/",
    "/contact.html?utm_source=fiche&a=1",
    "/sitemap.xml",
    "/assets/a%20b.jpg",
  ]) {
    const request = new Request("https://awz-renovation.jf-seignemorte.workers.dev" + path);
    const response = worker.fetch(request, {});
    assert.equal(response.status, 301);
    assert.equal(response.headers.get("Location"), origin + path);
  }
});

test("production and preview requests reach the static assets with their original URL", async () => {
  for (const host of [origin, "https://preview-awz-renovation.jf-seignemorte.workers.dev"]) {
    const request = new Request(host + "/contact.html?source=test");
    const asset = new Response("Contact");
    const ASSETS = {
      fetch(received) {
        assert.equal(received, request);
        return asset;
      },
    };
    assert.equal(await worker.fetch(request, { ASSETS }), asset);
  }
});
