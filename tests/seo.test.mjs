import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolveSiteUrl, resolveIndexable } from "../scripts/site-settings.mjs";
import { renderFaq, jsonLd } from "../scripts/seo.mjs";

const read = (file) => readFileSync(`dist/${file}`, "utf8");
const origin = "https://seo-test.example";
const build = (env = {}) =>
  execFileSync(process.execPath, ["scripts/build.mjs"], {
    env: { ...process.env, SITE_URL: origin, SITE_INDEXABLE: "true", ...env },
    stdio: "pipe",
  });
let pages;
before(() => {
  build();
  pages = readdirSync("dist").filter((file) => file.endsWith(".html"));
});
after(() => execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "pipe" }));

test("domain configuration rejects paths, credentials and invalid preview flags", () => {
  assert.equal(resolveSiteUrl("https://example.fr/"), "https://example.fr");
  for (const value of [
    "https://a.fr/path",
    "https://user:password@a.fr",
    "https://a.fr/?q=1",
    "https://a.fr/#x",
    "ftp://a.fr",
  ])
    assert.throws(() => resolveSiteUrl(value));
  assert.equal(resolveIndexable("false"), false);
  assert.throws(() => resolveIndexable("no"));
});

test("all emitted pages use the selected domain and have discoverable local links", () => {
  const titles = new Set();
  for (const file of pages) {
    const html = read(file);
    assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}|awz-renovation\.fr|workers\.dev/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, file);
    const canonical = html.match(/rel="canonical"\s+href="([^"]+)"/)[1];
    assert.equal(canonical, `${origin}/${file === "index.html" ? "" : file}`, file);
    assert.match(html, /name="robots" content="index, follow, max-image-preview:large"/);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title\s*>/)[1].trim();
    assert.ok(!titles.has(title), `duplicate title: ${file}`);
    titles.add(title);
    for (const [, href] of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)) {
      if (!/^(https?:|mailto:|tel:)/.test(href))
        assert.ok(existsSync(`dist/${href}`), `${file}: missing ${href}`);
    }
    for (const [, raw] of html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script\s*>/g,
    )) {
      const schema = JSON.parse(raw);
      assert.ok(schema["@graph"].some((entity) => entity["@id"] === `${origin}/#entreprise`));
    }
  }
});

test("the sitemap covers generated pages and existing project photographs", () => {
  const xml = read("sitemap.xml");
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(urls).size, pages.length);
  for (const file of pages)
    assert.ok(urls.includes(`${origin}/${file === "index.html" ? "" : file}`));
  const images = [...xml.matchAll(/<image:loc>(.*?)<\/image:loc>/g)];
  assert.ok(images.length > 0);
  for (const [, url] of images) assert.ok(existsSync(`dist/${url.slice(origin.length + 1)}`), url);
  assert.match(read("robots.txt"), /User-agent: \*\nAllow: \/\n/);
  assert.ok(read("robots.txt").includes(`${origin}/sitemap.xml`));
});

test("Cloudflare aliases redirect to canonical files without losing old clean URLs", () => {
  const redirects = read("_redirects")
    .trim()
    .split("\n")
    .map((line) => line.split(" "));
  assert.equal(new Set(redirects.map(([source]) => source)).size, redirects.length);
  assert.deepEqual(
    redirects.find(([source]) => source === "/"),
    ["/", "/index.html", "200"],
  );
  for (const file of pages.filter((file) => file !== "index.html")) {
    const slug = file.replace(/\.html$/, "");
    for (const source of [`/${slug}`, `/${slug}/`])
      assert.deepEqual(
        redirects.find(([from]) => from === source),
        [source, `/${file}`, "301"],
      );
    assert.ok(!redirects.some(([source]) => source === `/${file}`));
  }
  for (const [, target] of redirects) assert.ok(target === "/" || existsSync(`dist${target}`));
});

test("project pages are linked, retain their real photos and do not invent a location", () => {
  const projects = JSON.parse(readFileSync("assets/images/realisations/projects.json", "utf8"));
  for (const project of projects) {
    const file = `realisation-${project.date}.html`;
    assert.ok(read("realisations.html").includes(`href="${file}"`));
    const html = read(file);
    assert.ok(html.includes(`assets/images/realisations/${project.date}/`));
    const schema = JSON.parse(
      html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script\s*>/)[1],
    );
    const work = schema["@graph"].find((item) => item["@type"] === "CreativeWork");
    assert.equal(work.contentLocation?.name, project.city);
    assert.ok(!("datePublished" in work), "a work date is not a publication date");
  }
  assert.doesNotMatch(
    read("index.html"),
    /consumer\/my-projects|<strong>5 étoiles|note globale de 5/,
  );
});

test("FAQs and structured data escape untrusted text", () => {
  const attack = '</script><img src=x onerror="alert(1)">';
  assert.doesNotMatch(renderFaq([{ question: attack, answer: attack }]), /<img|<script/);
  assert.doesNotMatch(jsonLd({ name: attack }), /<\/script>/);
  assert.equal(JSON.parse(jsonLd({ name: attack })).name, attack);
});

test("a preview stays crawlable but sends noindex and advertises no sitemap", () => {
  build({ SITE_INDEXABLE: "false" });
  for (const file of pages) assert.match(read(file), /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(read("robots.txt"), /Disallow: \/|Sitemap:/);
  assert.doesNotMatch(read("sitemap.xml"), /<loc>/);
});
