import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { site, cities, mailto } from "./config.mjs";
import { buildProjects } from "./projects.mjs";
import { renderCity, renderPartials } from "./pages.mjs";
import {
  renderHomeProject,
  renderFeaturedProjects,
  renderCityProjects,
} from "./render-projects.mjs";
import { assertResolved } from "./html.mjs";
import { buildStyles } from "./styles.mjs";
import {
  services,
  faq,
  renderService,
  renderProject,
  renderFaqPage,
  renderServiceLinks,
  projectImages,
} from "./content-pages.mjs";
import { renderFaq, renderSitemap, searchMetadata, renderRedirects } from "./seo.mjs";

const projects = buildProjects();
const projectTokens = {
  HOME_PROJECT: renderHomeProject(projects),
  FEATURED_PROJECTS: renderFeaturedProjects(projects, mailto),
  CITY_PROJECTS: renderCityProjects(projects),
  SERVICE_LINKS: renderServiceLinks(),
  HOME_FAQ: renderFaq(faq.slice(0, 4), "Votre projet, en pratique"),
};
const staticPages = readdirSync(".")
  .filter((file) => file.endsWith(".html"))
  .sort();
const pages = new Map(
  staticPages.map((file) => [file, renderPartials(readFileSync(file, "utf8"), projectTokens)]),
);
function addPage(file, html) {
  if (pages.has(file)) throw new Error(`${file}: URL de page dupliquée`);
  pages.set(file, html);
}
for (const city of cities) {
  const local = projects.filter((project) => project.city === city.city);
  addPage(
    city.file,
    renderCity(city, {
      ...projectTokens,
      CITY_PROJECTS: renderCityProjects(local.length ? local : projects),
      CITY_SERVICE_LINKS: renderServiceLinks(city.serviceFiles),
    }),
  );
}
for (const service of services)
  addPage(service.file, renderService(service, projects, projectTokens));
for (const project of projects) addPage(project.file, renderProject(project, projectTokens));
addPage("questions-frequentes.html", renderFaqPage(projectTokens));
for (const [file, html] of pages) {
  assertResolved(html, file);
  pages.set(file, html.replace(/<\/head\b/, `${searchMetadata()}</head`));
}

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const [file, html] of pages) writeFileSync(`dist/${file}`, html);
cpSync("assets/images", "dist/assets/images", {
  recursive: true,
  filter: (source) => !source.endsWith(".json"),
});
cpSync("assets/js", "dist/assets/js", { recursive: true });
await buildStyles(pages);

writeFileSync(
  "dist/sitemap.xml",
  renderSitemap(
    site.indexable ? [...pages.keys()] : [],
    new Map(projects.map((project) => [project.file, projectImages(project)])),
  ),
);
writeFileSync(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\n${site.indexable ? `Sitemap: ${site.siteUrl}/sitemap.xml\n` : "# Prévisualisation : chaque page porte une directive noindex.\n"}`,
);
writeFileSync("dist/_redirects", renderRedirects([...pages.keys()]));
console.log(
  `Build OK: ${projects.length} réalisations, ${cities.length} villes, ${services.length} prestations, ${pages.size} pages.`,
);
