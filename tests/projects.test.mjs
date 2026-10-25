import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildProjects } from "../scripts/projects.mjs";
import {
  renderHomeProject,
  renderFeaturedProjects,
  renderCityProjects,
} from "../scripts/render-projects.mjs";
import { assertResolved } from "../scripts/html.mjs";
import { replaceTokens } from "../scripts/config.mjs";

const metadata = {
  date: "2026-01-21",
  category: "interieur",
  label: "Intérieur",
  title: "Rénovation",
  description: "Un chantier",
  points: ["Travaux"],
};
function fixture(t, entries = [metadata], files = ["1.webp"]) {
  const root = mkdtempSync(join(tmpdir(), "awz-projects-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "projects.json"), JSON.stringify(entries));
  for (const entry of entries) {
    mkdirSync(join(root, entry.date), { recursive: true });
    for (const name of files) writeFileSync(join(root, entry.date, name), "");
  }
  return root;
}

test("gallery images are sorted numerically and no source JS is generated", (t) => {
  const root = fixture(t, [metadata], ["10.webp", "2.webp", "1.webp"]);
  const [project] = buildProjects(root);
  assert.deepEqual(
    project.images.map((image) => image.split("/").at(-1)),
    ["1.webp", "2.webp", "10.webp"],
  );
  assert.equal(project.mode, "gallery");
});
test("comparison images must be paired", (t) => {
  assert.throws(() => buildProjects(fixture(t, [metadata], ["avant.webp"])), /présents ensemble/);
});
test("rejects impossible dates, duplicates, unknown categories and invalid points", (t) => {
  for (const entries of [
    [{ ...metadata, date: "2026-02-30" }],
    [metadata, metadata],
    [{ ...metadata, category: "missing" }],
    [{ ...metadata, points: "not an array" }],
  ])
    assert.throws(() => buildProjects(fixture(t, entries)), /invalide|inconnue|points/);
});
test("supports empty portfolios and gallery-only homepage portfolios", (t) => {
  assert.equal(renderHomeProject([]), "");
  assert.equal(renderCityProjects([]), "");
  const projects = buildProjects(fixture(t));
  const home = renderHomeProject(projects);
  assert.match(home, /2026-01-21\/1.webp/);
  assert.doesNotMatch(home, /undefined|type="range"/);
});
test("escapes project text and mailto attributes in generated HTML", (t) => {
  const source = {
    ...metadata,
    title: '<img onerror="alert(1)"> & rénovation',
    points: ["<script>bad</script>"],
  };
  const projects = buildProjects(fixture(t, [source]));
  for (const html of [
    renderHomeProject(projects),
    renderCityProjects(projects),
    renderFeaturedProjects(projects, 'mailto:test@example.com?subject="Quote"'),
  ]) {
    assert.doesNotMatch(html, /<img onerror|<script>bad|subject="Quote"/);
    assert.match(html, /&lt;img onerror=&quot;/);
  }
});
test("unresolved tokens fail explicitly", () => {
  assert.throws(
    () => assertResolved(replaceTokens("{{UNKNOWN_TOKEN}}"), "test.html"),
    /UNKNOWN_TOKEN/,
  );
  assert.doesNotThrow(() => assertResolved(replaceTokens("{{ARTISAN_NAME}}"), "test.html"));
});

test("verified project details survive rendering and malformed details are rejected", (t) => {
  const meta = {
    ...metadata,
    city: "Avoine",
    duration: "3 jours",
    surface: "12 m²",
    materials: ["Pierre"],
    context: "Avant travaux",
    workDetails: ["Reprise des joints"],
  };
  const [project] = buildProjects(fixture(t, [meta]));
  assert.equal(project.file, "realisation-2026-01-21.html");
  assert.equal(project.city, "Avoine");
  assert.deepEqual(project.materials, ["Pierre"]);
  for (const invalid of [
    { city: "" },
    { duration: 3 },
    { materials: "Pierre" },
    { workDetails: [null] },
  ])
    assert.throws(() => buildProjects(fixture(t, [{ ...metadata, ...invalid }])));
});
