import { readFileSync } from "node:fs";
import { artisan, cities } from "./config.mjs";
import { renderPartials } from "./pages.mjs";
import { escapeHtml } from "./html.mjs";
import { renderCityProjects, renderProjectMedia } from "./render-projects.mjs";
import { pageUrl, pageSchema, renderBreadcrumbs, renderFaq } from "./seo.mjs";

export const services = JSON.parse(readFileSync("assets/config/services.json", "utf8"));
export const faq = JSON.parse(readFileSync("assets/config/faq.json", "utf8"));
const detailTemplate = readFileSync("templates/pages/detail.html", "utf8");
const filenames = new Set();
for (const service of services) {
  for (const field of ["file", "category", "name", "title", "description", "image", "intro"])
    if (typeof service[field] !== "string" || !service[field].trim())
      throw new Error(`Service : ${field} manquant`);
  if (!/^[a-z0-9-]+\.html$/.test(service.file) || filenames.has(service.file))
    throw new Error(`Service : fichier invalide ou dupliqué ${service.file}`);
  filenames.add(service.file);
  if (
    !Array.isArray(service.sections) ||
    !service.sections.length ||
    service.sections.some(
      (section) =>
        typeof section.title !== "string" ||
        !section.title.trim() ||
        typeof section.text !== "string" ||
        !section.text.trim(),
    )
  )
    throw new Error(`${service.file}: sections invalides`);
}
for (const items of [faq, ...services.map((service) => service.faq)]) {
  if (
    !Array.isArray(items) ||
    !items.length ||
    items.some(
      (item) =>
        typeof item.question !== "string" ||
        !item.question.trim() ||
        typeof item.answer !== "string" ||
        !item.answer.trim(),
    )
  )
    throw new Error("FAQ : questions et réponses non vides requises");
}

export function renderServiceLinks(files = services.map((service) => service.file)) {
  return files
    .map((file) => {
      const service = services.find((entry) => entry.file === file);
      if (!service) throw new Error(`Prestation inconnue : ${file}`);
      return `<a class="underline underline-offset-4" href="${escapeHtml(file)}">${escapeHtml(service.name)}</a>`;
    })
    .join("");
}

function renderDetail(
  { file, title, description, heading, intro, image, caption, body, breadcrumbs, entity },
  tokens,
) {
  return renderPartials(detailTemplate, {
    ...tokens,
    ...Object.fromEntries(
      Object.entries({
        DETAIL_TITLE: title,
        DETAIL_DESCRIPTION: description,
        DETAIL_URL: pageUrl(file),
        DETAIL_IMAGE_URL: pageUrl(image),
        DETAIL_HEADING: heading,
        DETAIL_INTRO: intro,
        DETAIL_IMAGE: image,
        DETAIL_CAPTION: caption,
      }).map(([key, value]) => [key, escapeHtml(value)]),
    ),
    DETAIL_BREADCRUMBS: renderBreadcrumbs(breadcrumbs),
    DETAIL_SCHEMA: pageSchema({ file, title, description, breadcrumbs, entity }),
    DETAIL_BODY: body,
  });
}

export function renderService(service, projects, tokens) {
  const selected = projects.filter((project) => project.cat === service.category);
  const related = selected.length ? selected : projects;
  const breadcrumbs = [
    { name: "Accueil", file: "index.html" },
    { name: "Prestations", file: "index.html#services" },
    { name: service.name, file: service.file },
  ];
  const body = `<div class="mx-auto max-w-4xl px-4 sm:px-6 py-16 space-y-10">${service.sections
    .map(
      (section) =>
        `<section><h2 class="font-serif-display text-3xl text-awz">${escapeHtml(section.title)}</h2><p class="mt-5 leading-8 text-slate-600">${escapeHtml(section.text)}</p></section>`,
    )
    .join("")}</div>
    <section class="bg-sand py-16"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><h2 class="font-serif-display text-3xl text-awz">${selected.length ? "Réalisations pour cette prestation" : "Découvrez les réalisations AWZ"}</h2><div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">${renderCityProjects(related)}</div><a class="mt-6 inline-block underline underline-offset-4" href="realisations.html">Toutes les réalisations</a></div></section>
    <section class="mx-auto max-w-4xl px-4 sm:px-6 py-16"><h2 class="font-serif-display text-3xl text-awz">Votre chantier et sa localisation</h2><p class="mt-5 leading-7 text-slate-600">${escapeHtml(artisan.name)} est basée à ${escapeHtml(artisan.city)}. Précisez la commune de votre chantier pour confirmer les modalités d’intervention.</p><div class="mt-5 flex flex-wrap gap-x-5 gap-y-3">${cities.map((city) => `<a class="underline underline-offset-4" href="${escapeHtml(city.file)}">${escapeHtml(city.city)}</a>`).join("")}</div></section>
    ${renderFaq(service.faq)}
    <section class="mx-auto max-w-4xl px-4 sm:px-6 pt-12"><h2 class="font-serif-display text-2xl text-awz">Prestations complémentaires</h2><div class="mt-5 flex flex-wrap gap-x-6 gap-y-3">${renderServiceLinks(services.filter((item) => item !== service).map((item) => item.file))}</div></section>`;
  return renderDetail(
    {
      ...service,
      heading: service.name,
      caption:
        "Photographie d’illustration du métier. Les chantiers AWZ sont présentés ci-dessous.",
      body,
      breadcrumbs,
      entity: {
        "@type": "Service",
        "@id": `${pageUrl(service.file)}#prestation`,
        name: service.name,
        serviceType: service.name,
        description: service.description,
        url: pageUrl(service.file),
        provider: { "@id": pageUrl("#entreprise") },
        areaServed: cities.map((city) => ({ "@type": "City", name: city.city })),
      },
    },
    tokens,
  );
}

export function projectImages(project) {
  return project.mode === "compare"
    ? [project.before, project.after, ...project.gallery]
    : project.images;
}

export function renderProject(project, tokens) {
  const service = services.find((entry) => entry.category === project.cat);
  if (!service) throw new Error(`${project.id}: prestation introuvable`);
  const images = projectImages(project);
  const title = `${project.title}${project.city ? ` à ${project.city}` : ""} | AWZ-Rénovation`;
  const breadcrumbs = [
    { name: "Accueil", file: "index.html" },
    { name: "Réalisations", file: "realisations.html" },
    { name: project.title, file: project.file },
  ];
  const facts = [
    [
      "Date du chantier",
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(`${project.date}T00:00:00Z`),
      ),
    ],
    ...(project.city ? [["Commune", project.city]] : []),
    ...(project.duration ? [["Durée", project.duration]] : []),
    ...(project.surface ? [["Surface", project.surface]] : []),
    ...(project.materials?.length ? [["Matériaux", project.materials.join(", ")]] : []),
  ];
  const city = cities.find((entry) => entry.city === project.city);
  const body = `<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16"><div class="grid lg:grid-cols-[1.5fr_1fr] gap-10">
    <div><h2 class="font-serif-display text-3xl text-awz">${project.mode === "compare" ? "Le chantier avant et après" : "Photos du chantier"}</h2><div class="mt-8">${renderProjectMedia(project)}</div></div>
    <div><h2 class="font-serif-display text-3xl text-awz">Travaux réalisés</h2><ul class="mt-5 list-disc pl-5 space-y-3 text-slate-600">${project.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
    ${project.context ? `<h3 class="mt-8 font-semibold text-awz">Avant les travaux</h3><p class="mt-3 leading-7 text-slate-600">${escapeHtml(project.context)}</p>` : ""}
    ${(project.workDetails ?? []).map((detail) => `<p class="mt-4 leading-7 text-slate-600">${escapeHtml(detail)}</p>`).join("")}
    <dl class="mt-8 space-y-4">${facts.map(([name, value]) => `<div><dt class="font-semibold text-awz">${escapeHtml(name)}</dt><dd class="mt-1 text-slate-600">${escapeHtml(value)}</dd></div>`).join("")}</dl>
    <a class="mt-8 inline-block font-semibold underline underline-offset-4 text-awz" href="${service.file}">Découvrir la prestation ${escapeHtml(service.name)}</a>
    ${city ? `<a class="mt-4 block underline underline-offset-4" href="${city.file}">Interventions à ${escapeHtml(city.city)}</a>` : ""}
    <a class="mt-4 block underline underline-offset-4" href="realisations.html">Retour à toutes les réalisations</a></div></div></section>`;
  return renderDetail(
    {
      file: project.file,
      title,
      description: project.copy,
      heading: project.title,
      intro: project.copy,
      image: project.after ?? images[0],
      caption: "Photographie de cette réalisation AWZ-Rénovation.",
      body,
      breadcrumbs,
      entity: {
        "@type": "CreativeWork",
        "@id": `${pageUrl(project.file)}#realisation`,
        name: project.title,
        description: project.copy,
        url: pageUrl(project.file),
        creator: { "@id": pageUrl("#entreprise") },
        image: images.map(pageUrl),
        about: { "@id": `${pageUrl(service.file)}#prestation` },
        ...(project.city ? { contentLocation: { "@type": "Place", name: project.city } } : {}),
      },
    },
    tokens,
  );
}

export function renderFaqPage(tokens) {
  return renderDetail(
    {
      file: "questions-frequentes.html",
      title: "Questions fréquentes avant vos travaux | AWZ-Rénovation",
      description:
        "Prestations, zones d’intervention, devis gratuit et photos de chantiers : les réponses d’AWZ-Rénovation pour préparer votre projet de travaux.",
      heading: "Préparer votre projet de travaux",
      intro:
        "Retrouvez les informations pratiques pour contacter AWZ-Rénovation et préparer votre demande de devis.",
      image: "assets/images/brand/social-share.jpg",
      caption: "Maçonnerie, rénovation, pierre et tuffeau à Avoine et alentours.",
      breadcrumbs: [
        { name: "Accueil", file: "index.html" },
        { name: "Questions fréquentes", file: "questions-frequentes.html" },
      ],
      body: `${renderFaq(faq)}<section class="mx-auto max-w-4xl px-4 sm:px-6 pt-12"><h2 class="font-serif-display text-2xl text-awz">En savoir plus sur chaque prestation</h2><div class="mt-5 flex flex-wrap gap-x-6 gap-y-3">${renderServiceLinks()}</div></section>`,
    },
    tokens,
  );
}
