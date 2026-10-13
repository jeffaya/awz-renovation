import { escapeHtml } from "./html.mjs";
function responsiveAttrs(src) {
  return `src="${src}" loading="lazy" decoding="async"`;
}
function comparisonMarkup(p, height = "h-80 lg:h-[470px]") {
  return `<div data-comparison class="comparison ${height} rounded-2xl bg-stone-200"><img class="comparison-after" ${responsiveAttrs(p.after)} alt="Après ${p.title}"><div data-comparison-before class="comparison-before"><img ${responsiveAttrs(p.before)} alt="Avant ${p.title}"></div><input type="range" min="0" max="100" value="50" aria-label="Comparer avant et après"><span class="label before-label">AVANT</span><span class="label after-label">APRÈS</span><span data-comparison-handle class="handle"><i class="bi bi-arrow-left-right"></i></span></div>`;
}
function galleryMarkup(p, height = "h-80 lg:h-[470px]") {
  const imgs = p.images || [];
  const first = imgs[0] || "";
  if (imgs.length === 1)
    return `<div class="${height} overflow-hidden rounded-2xl bg-stone-100"><img class="awz-zoomable h-full w-full object-cover" src="${first}" loading="lazy" decoding="async" alt="${p.title}"></div>`;
  const second = imgs[1];
  return `<div class="grid grid-cols-2 gap-2 ${height} overflow-hidden rounded-2xl bg-stone-100">
   <img class="awz-zoomable h-full w-full object-cover" src="${first}" loading="lazy" decoding="async" alt="${p.title}">
   <img class="awz-zoomable h-full w-full object-cover" src="${second}" loading="lazy" decoding="async" alt="${p.title}">
 </div>`;
}
function mediaMarkup(p, height) {
  return p.mode === "compare" ? comparisonMarkup(p, height) : galleryMarkup(p, height);
}
function extraGallery(p) {
  const imgs = p.mode === "compare" ? p.gallery || [] : (p.images || []).slice(2);
  if (!imgs.length) return "";
  const cols =
    imgs.length >= 4
      ? "lg:grid-cols-4"
      : imgs.length === 3
        ? "lg:grid-cols-3"
        : imgs.length === 2
          ? "sm:grid-cols-2"
          : "grid-cols-1";
  return `<div class="mt-3 grid grid-cols-2 ${cols} gap-2">${imgs.map((x) => `<img class="awz-zoomable h-28 sm:h-36 w-full rounded-xl object-cover cursor-zoom-in" src="${x}" loading="lazy" decoding="async" alt="Photo supplémentaire — ${p.title}">`).join("")}</div>`;
}
function emojiFor(text) {
  const t = text.toLowerCase();
  if (t.includes("pierre") || t.includes("mur")) return "🧱";
  if (t.includes("façade") || t.includes("extérieur")) return "🏠";
  if (t.includes("sol")) return "◼️";
  if (t.includes("finition") || t.includes("détail")) return "✨";
  if (t.includes("aménagement")) return "🛠️";
  if (t.includes("rénovation") || t.includes("travaux")) return "🔨";
  return "✓";
}
function featureProject(p, mailto) {
  return `<article class="featured-shell" data-category="${p.cat}"><div class="featured-media">${mediaMarkup(p)}${extraGallery(p)}</div><div class="featured-copy"><p class="project-kicker">${p.label}</p><h2 class="font-serif-display text-3xl lg:text-4xl text-slate-900">${p.title}</h2><div class="featured-rule"></div><p class="mt-5 text-slate-600 leading-7">${p.copy}</p><div class="mt-6 space-y-3">${p.points.map((x) => `<div class="feature-point"><span aria-hidden="true">${emojiFor(x)}</span><p>${x}</p></div>`).join("")}</div><a href="${escapeHtml(mailto)}" class="btn-with-icon mt-8 rounded-full bg-awz px-6 py-3.5 font-semibold text-white shadow-sm">Demander un devis <i class="bi bi-arrow-right icon-inline" aria-hidden="true"></i></a></div></article>`;
}

function escapedProject(project) {
  return Object.fromEntries(
    Object.entries(project).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(escapeHtml) : escapeHtml(value),
    ]),
  );
}

export function renderFeaturedProjects(projects, mailto) {
  return projects.map((project) => featureProject(escapedProject(project), mailto)).join("");
}

export function renderHomeProject(projects) {
  const selected = projects.find((project) => project.mode === "compare") || projects[0];
  if (!selected) return "";
  const p = escapedProject(selected);
  const media =
    p.mode === "compare"
      ? `<div data-comparison class="home-comparison h-72 sm:h-96 lg:h-[480px] bg-stone-200"><img class="home-after" src="${p.after}" alt="Après ${p.title}" loading="lazy" decoding="async"><div data-comparison-before class="home-before"><img src="${p.before}" alt="Avant ${p.title}" loading="lazy" decoding="async"></div><input type="range" min="0" max="100" value="50" aria-label="Comparer avant et après"><span class="home-label home-before-label">AVANT</span><span class="home-label home-after-label">APRÈS</span><span data-comparison-handle class="home-handle"><i class="bi bi-arrow-left-right"></i></span></div>`
      : galleryMarkup(p, "h-72 sm:h-96 lg:h-[480px]");
  return `<a href="realisations.html" class="block group"><article class="w-full overflow-hidden rounded-3xl bg-white shadow-sm transition group-hover:shadow-lg">${media}<div class="p-5 sm:p-7 flex items-center justify-between gap-5"><div><h3 class="text-xl sm:text-2xl font-semibold">${p.title}</h3><p class="mt-1 text-sm text-slate-600">${p.copy}</p></div><span class="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-full bg-awz text-white"><i class="bi bi-arrow-right"></i></span></div></article></a>`;
}

export function renderCityProjects(projects) {
  return projects
    .slice(0, 3)
    .map((project) => {
      const p = escapedProject(project);
      return `<a href="realisations.html" class="group overflow-hidden rounded-2xl border border-stone-200 bg-white"><img src="${p.after || p.images[0]}" alt="${p.title} par AWZ-Rénovation" loading="lazy" decoding="async" class="h-48 w-full object-cover"><div class="p-4"><p class="text-xs uppercase tracking-[.16em] text-stone-500">${p.label}</p><h3 class="mt-1 font-semibold text-awz">${p.title}</h3></div></a>`;
    })
    .join("");
}
