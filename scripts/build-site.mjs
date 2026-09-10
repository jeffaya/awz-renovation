import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const config = JSON.parse(fs.readFileSync(path.join(root, "config", "site.json"), "utf8"));

const baseUrl = config.site.baseUrl.replace(/\/+$/, "");
const brandName = config.brand.name;
const brandDisplay = config.brand.displayName || brandName;
const phoneDisplay = config.contact.phoneDisplay;
const phoneE164 = config.contact.phoneE164;
const email = config.contact.email;
const street = config.contact.address.street;
const postalCode = config.contact.address.postalCode;
const city = config.contact.address.city;
const country = config.contact.address.country || "FR";
const siret = config.legal.siret;
const socialImagePath = config.social.shareImage.replace(/^\/+/, "");
const socialImageUrl = `${baseUrl}/${socialImagePath}`;

const oldDefaults = {
  baseUrls: [
    "https://www.awz-renovation.fr",
    "https://awz-renovation.fr",
    "https://awz-renovation.netlify.app"
  ],
  brandNames: ["AWZ-Rénovation"],
  brandDisplays: ["AWZ Rénovation"],
  phoneDisplays: ["06 78 81 66 96"],
  phoneE164s: ["+33678816696"],
  emails: ["antonywouenzell@yahoo.fr"],
  streets: ["2 rue du Gros Chillou", "2 rue du gros chillou"],
  postals: ["37420"],
  cities: ["Avoine"],
  sirets: ["511 157 307 00022"]
};

const excludeTop = new Set(["dist", ".git", "node_modules"]);

function copyTree(src, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (excludeTop.has(entry.name)) continue;
    if (entry.name === "scripts" || entry.name === "config") continue;
    const s = path.join(src, entry.name);
    const t = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(s, t);
    else fs.copyFileSync(s, t);
  }
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAllKnown(text, values, replacement) {
  for (const value of values) {
    text = text.replace(new RegExp(esc(value), "g"), replacement);
  }
  return text;
}

function pageUrlFor(file) {
  const name = path.basename(file);
  return name === "index.html" ? `${baseUrl}/` : `${baseUrl}/${name}`;
}

function patchHtml(file) {
  let html = fs.readFileSync(file, "utf8");

  // Company identity + contact details.
  html = replaceAllKnown(html, oldDefaults.brandNames, brandName);
  html = replaceAllKnown(html, oldDefaults.brandDisplays, brandDisplay);
  html = replaceAllKnown(html, oldDefaults.phoneDisplays, phoneDisplay);
  html = replaceAllKnown(html, oldDefaults.phoneE164s, phoneE164);
  html = replaceAllKnown(html, oldDefaults.emails, email);
  html = replaceAllKnown(html, oldDefaults.sirets, siret);

  // Address values. Do these after city-specific page copy stays untouched.
  html = html.replace(/"streetAddress"\s*:\s*"[^"]*"/g, `"streetAddress":"${street}"`);
  html = html.replace(/"postalCode"\s*:\s*"[^"]*"/g, `"postalCode":"${postalCode}"`);
  html = html.replace(/"addressLocality"\s*:\s*"[^"]*"/g, `"addressLocality":"${city}"`);
  html = html.replace(/"addressCountry"\s*:\s*"[^"]*"/g, `"addressCountry":"${country}"`);

  // Common visible address variants.
  for (const oldStreet of oldDefaults.streets) {
    html = html.replace(new RegExp(esc(oldStreet), "gi"), street);
  }
  html = html.replace(/37420\s+Avoine/g, `${postalCode} ${city}`);

  const pageUrl = pageUrlFor(file);

  // Canonical and Open Graph URLs are generated from the configured domain.
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="canonical" href="${pageUrl}">`
  );

  if (/<meta\s+property=["']og:url["']/i.test(html)) {
    html = html.replace(
      /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:url" content="${pageUrl}">`
    );
  } else {
    html = html.replace("</title>", `</title><meta property="og:url" content="${pageUrl}">`);
  }

  html = html.replace(
    /<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:image" content="${socialImageUrl}">`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:image" content="${socialImageUrl}">`
  );

  // Keep social title/description centrally configurable.
  if (/<meta\s+property=["']og:title["']/i.test(html)) {
    html = html.replace(
      /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:title" content="${config.social.title || brandName}">`
    );
  }
  if (/<meta\s+property=["']og:description["']/i.test(html)) {
    html = html.replace(
      /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:description" content="${config.social.description}">`
    );
  }

  // JSON-LD website URL and identity.
  html = html.replace(/"url"\s*:\s*"https?:\/\/[^"]+"/g, `"url":"${baseUrl}/"`);
  html = html.replace(/"telephone"\s*:\s*"[^"]+"/g, `"telephone":"${phoneE164}"`);
  html = html.replace(/"email"\s*:\s*"[^"]+"/g, `"email":"${email}"`);
  html = html.replace(/"name"\s*:\s*"AWZ-Rénovation"/g, `"name":"${brandName}"`);

  fs.writeFileSync(file, html);
}

function patchTextFile(file) {
  let text = fs.readFileSync(file, "utf8");
  for (const oldBase of oldDefaults.baseUrls) {
    text = text.replace(new RegExp(esc(oldBase), "g"), baseUrl);
  }
  fs.writeFileSync(file, text);
}

fs.rmSync(dist, { recursive: true, force: true });
copyTree(root, dist);

for (const file of fs.readdirSync(dist)) {
  if (file.endsWith(".html")) patchHtml(path.join(dist, file));
}

for (const name of ["robots.txt", "sitemap.xml"]) {
  const file = path.join(dist, name);
  if (fs.existsSync(file)) patchTextFile(file);
}

console.log(`Built ${brandName} -> ${dist}`);
console.log(`Base URL: ${baseUrl}`);
console.log(`Open Graph image: ${socialImageUrl}`);
