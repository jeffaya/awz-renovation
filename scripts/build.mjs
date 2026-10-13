import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { site, cities, mailto } from "./config.mjs";
import { buildProjects } from "./projects.mjs";
import { renderCity, renderPartials } from "./pages.mjs";
import {
  renderHomeProject,
  renderFeaturedProjects,
  renderCityProjects,
} from "./render-projects.mjs";
import { assertResolved, escapeHtml } from "./html.mjs";
import { buildStyles } from "./styles.mjs";

const projects = buildProjects();
const projectTokens = {
  HOME_PROJECT: renderHomeProject(projects),
  FEATURED_PROJECTS: renderFeaturedProjects(projects, mailto),
  CITY_PROJECTS: renderCityProjects(projects),
};
const staticPages = readdirSync(".")
  .filter((file) => file.endsWith(".html"))
  .sort();
const pages = new Map(
  staticPages.map((file) => [file, renderPartials(readFileSync(file, "utf8"), projectTokens)]),
);
for (const city of cities) {
  if (pages.has(city.file))
    throw new Error(`${city.file}: conflit entre une page statique et une ville`);
  pages.set(city.file, renderCity(city, projectTokens));
}
for (const [file, html] of pages) assertResolved(html, file);

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const [file, html] of pages) writeFileSync(`dist/${file}`, html);
cpSync("assets/images", "dist/assets/images", {
  recursive: true,
  filter: (source) => !source.endsWith(".json"),
});
cpSync("assets/js", "dist/assets/js", { recursive: true });
await buildStyles(pages);

const urls = [...pages.keys()].map(
  (file) => `${site.siteUrl}/${file === "index.html" ? "" : file}`,
);
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>\n`,
);
writeFileSync("dist/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
console.log(
  `Build OK: ${projects.length} réalisations, ${cities.length} villes, ${staticPages.length} pages statiques.`,
);
