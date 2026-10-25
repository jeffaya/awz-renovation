import { artisan, site, businessData } from "./config.mjs";
import { escapeHtml } from "./html.mjs";

export const pageUrl = (file = "") => `${site.siteUrl}/${file === "index.html" ? "" : file}`;
export const jsonLd = (data) => JSON.stringify(data).replace(/</g, "\\u003c");

export function pageSchema({ file, title, description, breadcrumbs, entity }) {
  const url = pageUrl(file);
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      businessData(),
      {
        "@type": "WebSite",
        "@id": pageUrl("#site"),
        url: pageUrl(),
        name: artisan.name,
        inLanguage: "fr-FR",
        publisher: { "@id": pageUrl("#entreprise") },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: title,
        description,
        inLanguage: "fr-FR",
        isPartOf: { "@id": pageUrl("#site") },
        breadcrumb: { "@id": `${url}#fil-ariane` },
        ...(entity ? { mainEntity: { "@id": entity["@id"] } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#fil-ariane`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: pageUrl(crumb.file),
        })),
      },
      ...(entity ? [entity] : []),
    ],
  });
}

export function renderBreadcrumbs(items) {
  return `<nav aria-label="Fil d’Ariane" class="mb-6 text-sm"><ol class="flex flex-wrap gap-x-2 gap-y-2">${items
    .map(
      (item, i) =>
        `<li class="flex items-center gap-2">${i ? '<span aria-hidden="true">/</span>' : ""}${
          i === items.length - 1
            ? `<span aria-current="page">${escapeHtml(item.name)}</span>`
            : `<a class="underline underline-offset-4" href="${escapeHtml(item.file)}">${escapeHtml(item.name)}</a>`
        }</li>`,
    )
    .join("")}</ol></nav>`;
}

export function renderFaq(items, title = "Questions fréquentes") {
  return `<section class="py-16 bg-sand"><div class="mx-auto max-w-4xl px-4 sm:px-6"><h2 class="font-serif-display text-3xl lg:text-4xl text-awz">${escapeHtml(title)}</h2><div class="mt-8 space-y-4">${items
    .map(
      ({ question, answer }) =>
        `<details class="rounded-2xl border border-stone-200 bg-white p-5"><summary class="cursor-pointer font-semibold text-awz">${escapeHtml(question)}</summary><p class="mt-4 leading-7 text-slate-600">${escapeHtml(answer)}</p></details>`,
    )
    .join("")}</div></div></section>`;
}

export function searchMetadata() {
  // noindex must remain crawlable so search engines can read the directive.
  return `<meta name="robots" content="${site.indexable ? "index, follow, max-image-preview:large" : "noindex, follow"}">`;
}

export function renderRedirects(files) {
  // Keep canonical .html URLs on Cloudflare and preserve its former clean URLs.
  // The root rewrite is internal; _redirects rules are not applied recursively.
  return [
    "/ /index.html 200",
    "/index.html / 301",
    "/index / 301",
    "/index/ / 301",
    ...files
      .filter((file) => file !== "index.html")
      .flatMap((file) => {
        const slug = file.replace(/\.html$/, "");
        return [`/${slug} /${file} 301`, `/${slug}/ /${file} 301`];
      }),
    "",
  ].join("\n");
}

export function renderSitemap(files, images = new Map()) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${files
    .map(
      (file) =>
        `  <url><loc>${escapeHtml(pageUrl(file))}</loc>${(images.get(file) ?? []).map((image) => `<image:image><image:loc>${escapeHtml(pageUrl(image))}</image:loc></image:image>`).join("")}</url>`,
    )
    .join("\n")}\n</urlset>\n`;
}
