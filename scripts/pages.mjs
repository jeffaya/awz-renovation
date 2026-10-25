import { readFileSync } from "node:fs";
import { site, replaceTokens, businessSchema } from "./config.mjs";
import { escapeHtml } from "./html.mjs";
import { pageSchema, renderBreadcrumbs } from "./seo.mjs";

const partials = Object.fromEntries(
  ["header", "footer", "mobile-cta", "emergency-bar", "zones", "assets"].map((name) => [
    `PARTIAL_${name.replaceAll("-", "_").toUpperCase()}`,
    readFileSync(`templates/partials/${name}.html`, "utf8"),
  ]),
);
const cityTemplate = readFileSync("templates/pages/city.html", "utf8");

export function renderPartials(text, values = {}) {
  const tokens = {
    BUSINESS_SCHEMA: businessSchema(),
    HOME_SCHEMA: businessSchema(),
    ...values,
  };
  return replaceTokens(text, {
    ...Object.fromEntries(
      Object.entries(partials).map(([key, source]) => [key, replaceTokens(source, tokens)]),
    ),
    ...tokens,
  });
}

export function renderCity(city, values = {}) {
  const breadcrumbs = [
    { name: "Accueil", file: "index.html" },
    { name: "Zones d’intervention", file: "zones-intervention.html" },
    { name: city.city, file: city.file },
  ];
  const paragraphs = city.localParagraphs
    .map(
      (paragraph, index) =>
        `<p class="${index ? "mt-4" : "mt-6"} max-w-2xl leading-7 text-slate-600">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
  const cityTokens = Object.fromEntries(
    Object.entries({
      CITY_TITLE: city.title,
      CITY_DESCRIPTION: city.description,
      CITY_CANONICAL: `${site.siteUrl}/${city.file}`,
      CITY_HERO_IMAGE: city.heroImage,
      CITY_HERO_ALT: city.heroAlt,
      CITY_HERO_TITLE: city.heroTitle,
      CITY_HERO_COPY: city.heroCopy,
      CITY_LOCAL_TITLE: city.localTitle,
    }).map(([key, value]) => [key, escapeHtml(value)]),
  );
  return renderPartials(cityTemplate, {
    ...cityTokens,
    CITY_LOCAL_PARAGRAPHS: paragraphs,
    ...values,
    CITY_BREADCRUMBS: renderBreadcrumbs(breadcrumbs),
    BUSINESS_SCHEMA: pageSchema({
      file: city.file,
      title: city.title,
      description: city.description,
      breadcrumbs,
    }),
  });
}
