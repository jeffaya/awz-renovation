import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";


// Artisan/business data: single source of truth.
const artisan = JSON.parse(readFileSync("assets/config/artisan.json", "utf8"));
for (const key of ["name","phone","phoneHref","email","address","postalCode","city","siret","website"]) {
  if (!artisan[key]) throw new Error(`artisan.json: champ ${key} manquant`);
}
function applyArtisanConfig(text) {
  const fullAddress = `${artisan.address}, ${artisan.postalCode} ${artisan.city}`;
  const values = {
    "{{ARTISAN_NAME}}": artisan.name,
    "{{ARTISAN_PHONE}}": artisan.phone,
    "{{ARTISAN_PHONE_HREF}}": artisan.phoneHref,
    "{{ARTISAN_EMAIL}}": artisan.email,
    "{{ARTISAN_ADDRESS}}": artisan.address,
    "{{ARTISAN_ADDRESS_HTML}}": `${artisan.address}<br>${artisan.postalCode} ${artisan.city}`,
    "{{ARTISAN_FULL_ADDRESS}}": fullAddress,
    "{{ARTISAN_SIRET}}": artisan.siret,
    "{{ARTISAN_WEBSITE}}": artisan.website,
    "{{ARTISAN_MAILTO}}": `mailto:${artisan.email}?subject=${encodeURIComponent("Demande de devis – "+artisan.name)}`
  };
  for (const [token,value] of Object.entries(values)) text=text.split(token).join(value);
  return text;
}

const realizationRoot = "assets/images/realisations";
const sourcePath = join(realizationRoot, "projects.json");
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const numberedPattern = /^(\d+)\.webp$/;

const source = JSON.parse(readFileSync(sourcePath, "utf8"));
if (!Array.isArray(source)) throw new Error("projects.json doit contenir un tableau.");

const seen = new Set();
const projects = source.map(meta => {
  for (const key of ["date","category","label","title","description","points"]) {
    if (meta[key] == null) throw new Error(`Projet: champ ${key} manquant`);
  }
  if (!datePattern.test(meta.date)) throw new Error(`${meta.date}: date invalide, format YYYY-MM-DD attendu`);
  if (seen.has(meta.date)) throw new Error(`${meta.date}: date de projet dupliquée`);
  seen.add(meta.date);

  const dir = join(realizationRoot, meta.date);
  if (!existsSync(dir)) throw new Error(`${meta.date}: répertoire manquant`);
  const names = readdirSync(dir);
  const hasBefore = names.includes("avant.webp");
  const hasAfter = names.includes("apres.webp");
  if (hasBefore !== hasAfter) throw new Error(`${meta.date}: avant.webp et apres.webp doivent être présents ensemble`);

  const numbered = names.filter(n => numberedPattern.test(n))
    .sort((a,b)=>Number(a.match(numberedPattern)[1])-Number(b.match(numberedPattern)[1]));
  if (!hasBefore && numbered.length === 0) throw new Error(`${meta.date}: aucune image trouvée`);

  const base=`assets/images/realisations/${meta.date}`;
  return {
    id:meta.date,date:meta.date,cat:meta.category,label:meta.label,title:meta.title,
    copy:meta.description,points:meta.points,
    mode:hasBefore?"compare":"gallery",
    ...(hasBefore
      ? {before:`${base}/avant.webp`,after:`${base}/apres.webp`,gallery:numbered.map(n=>`${base}/${n}`)}
      : {images:numbered.map(n=>`${base}/${n}`)})
  };
}).sort((a,b)=>b.date.localeCompare(a.date));

mkdirSync("assets/js",{recursive:true});
writeFileSync("assets/js/projects.js",
  `// GENERATED FILE — edit assets/images/realisations/projects.json instead.\n`+
  `window.AWZ_PROJECTS=${JSON.stringify(projects)};\n`+
  `window.AWZ_PROJECT_BY_ID=Object.fromEntries(window.AWZ_PROJECTS.map(p=>[p.id,p]));\n`+
  `window.AWZ_PROJECT_IMAGE=p=>p.after||((p.images||[])[0])||p.before||'';\n`
);


function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function projectImage(p){return p.after||(p.images||[])[0]||p.before||"";}
function projectCard(p){const img=projectImage(p);return `<article class="seo-project-card"><a href="/realisations.html"><img src="/${img}" alt="${esc(p.title)} – réalisation AWZ-Rénovation" loading="lazy" width="1200" height="800"><p>${esc(p.label)}</p><h3>${esc(p.title)}</h3><p>${esc(p.copy)}</p></a></article>`;}
function injectSeoProjectHtml(file,text){
 if(file==="index.html"){const p=projects.find(x=>x.mode==="compare")||projects[0];return text.replace('<div id="home-project" class="mt-10"></div>',`<div id="home-project" class="mt-10">${projectCard(p)}</div>`);}
 if(file==="realisations.html"){return text.replace('<section id="featured-projects" class="featured-project mt-10 space-y-10 lg:space-y-14"></section>',`<section id="featured-projects" class="featured-project mt-10 space-y-10 lg:space-y-14">${projects.map(projectCard).join("")}</section>`);}
 if(["angers.html","azay-le-rideau.html","langeais.html","loudun.html","macon-chinon.html","noyant.html","renovation-saumur.html","richelieu.html","tours.html","tuffeau-avoine.html"].includes(file)){return text.replace('<div id="city-projects" class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>',`<div id="city-projects" class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">${projects.slice(0,3).map(projectCard).join("")}</div>`);}
 return text;
}

const files=["robots.txt","sitemap.xml"];
rmSync("dist",{recursive:true,force:true});
mkdirSync("dist");
for(const f of readdirSync(".")) if(f.endsWith(".html")) files.push(f);
for(const f of files){if(f.endsWith(".html")) writeFileSync(`dist/${f}`,applyArtisanConfig(injectSeoProjectHtml(f,readFileSync(f,"utf8"))));else cpSync(f,`dist/${f}`);}
cpSync("assets","dist/assets",{recursive:true});
console.log(`Validated and generated ${projects.length} projects from projects.json.`);
console.log(`Copied ${files.length} files and assets/ to dist/`);
