import { readFileSync } from "node:fs";
import { escapeHtml } from "./html.mjs";

export const artisan = JSON.parse(readFileSync("assets/config/artisan.json", "utf8"));
export const site = JSON.parse(readFileSync("assets/config/site.json", "utf8"));
export const cities = JSON.parse(readFileSync("assets/config/cities.json", "utf8"));

for (const key of [
  "name",
  "phone",
  "phoneHref",
  "email",
  "address",
  "postalCode",
  "city",
  "siret",
  "artisanFirstName",
  "artisanLastName",
  "artisanFullName",
]) {
  if (typeof artisan[key] !== "string" || !artisan[key].trim())
    throw new Error(`artisan.json: champ ${key} manquant ou vide`);
}
const url = new URL(site.siteUrl);
if (
  !["https:", "http:"].includes(url.protocol) ||
  url.username ||
  url.password ||
  url.search ||
  url.hash
)
  throw new Error("site.json: siteUrl doit être une URL HTTP(S) sans paramètres");
site.siteUrl = site.siteUrl.replace(/\/+$/, "");
if (!Array.isArray(cities)) throw new Error("cities.json doit contenir un tableau");
const filenames = new Set();
for (const city of cities) {
  for (const key of [
    "file",
    "city",
    "title",
    "description",
    "heroImage",
    "heroAlt",
    "heroTitle",
    "heroCopy",
    "localTitle",
  ]) {
    if (typeof city[key] !== "string" || !city[key].trim())
      throw new Error(`Ville: champ ${key} manquant ou vide`);
  }
  if (!/^[a-z0-9-]+\.html$/.test(city.file) || filenames.has(city.file))
    throw new Error(`${city.file}: nom de page invalide ou dupliqué`);
  filenames.add(city.file);
  if (
    !Array.isArray(city.localParagraphs) ||
    city.localParagraphs.some((p) => typeof p !== "string")
  )
    throw new Error(`${city.file}: localParagraphs doit contenir des textes`);
}

export const mailto = `mailto:${artisan.email}?subject=${encodeURIComponent("Demande de devis – " + artisan.name)}`;
const fullAddress = `${artisan.address}, ${artisan.postalCode} ${artisan.city}`;
const baseTokens = Object.fromEntries(
  Object.entries({
    ARTISAN_NAME: artisan.name,
    ARTISAN_PHONE: artisan.phone,
    ARTISAN_PHONE_HREF: artisan.phoneHref,
    ARTISAN_EMAIL: artisan.email,
    ARTISAN_ADDRESS: artisan.address,
    ARTISAN_FULL_ADDRESS: fullAddress,
    ARTISAN_SIRET: artisan.siret,
    SITE_URL: site.siteUrl,
    ARTISAN_FIRST_NAME: artisan.artisanFirstName,
    ARTISAN_LAST_NAME: artisan.artisanLastName,
    ARTISAN_FULL_NAME: artisan.artisanFullName,
    ARTISAN_MAILTO: mailto,
  }).map(([key, value]) => [key, escapeHtml(value)]),
);
baseTokens.ARTISAN_ADDRESS_HTML = `${escapeHtml(artisan.address)}<br>${escapeHtml(artisan.postalCode)} ${escapeHtml(artisan.city)}`;

// Extra tokens are already rendered HTML (partials, project cards, JSON-LD).
export function replaceTokens(text, values = {}) {
  const tokens = { ...baseTokens, ...values };
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => tokens[key] ?? match);
}

export function businessSchema(home = false) {
  const data = {
    "@context": "https://schema.org",
    "@type": home
      ? ["LocalBusiness", "HomeAndConstructionBusiness"]
      : "HomeAndConstructionBusiness",
    name: artisan.name,
    url: `${site.siteUrl}/`,
    telephone: artisan.phoneHref,
    email: artisan.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: artisan.address,
      postalCode: artisan.postalCode,
      addressLocality: artisan.city,
      addressCountry: "FR",
    },
    areaServed: cities.map((city) => city.city),
    ...(home
      ? {
          description:
            "AWZ-Rénovation réalise vos travaux de maçonnerie, rénovation intérieure, pierre, tuffeau, façades et terrasses autour d’Avoine, Chinon et Saumur.",
        }
      : { priceRange: "€€" }),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
