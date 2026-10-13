import { readFileSync } from "node:fs";
import { site, replaceTokens, businessSchema } from "./config.mjs";
import { escapeHtml } from "./html.mjs";

const partials = Object.fromEntries(
  ["header", "footer", "mobile-cta", "emergency-bar", "zones", "assets"].map((name) => [
    `PARTIAL_${name.replaceAll("-", "_").toUpperCase()}`,
    replaceTokens(readFileSync(`templates/partials/${name}.html`, "utf8")),
  ]),
);
const cityTemplate = readFileSync("templates/pages/city.html", "utf8");

export function renderPartials(text, values = {}) {
  return replaceTokens(text, {
    ...partials,
    BUSINESS_SCHEMA: businessSchema(),
    HOME_SCHEMA: businessSchema(true),
    ...values,
  });
}

export function renderCity(city, values = {}) {
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
  });
}
