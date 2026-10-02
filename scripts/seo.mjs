const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const image=p=>p.after||(p.images||[])[0]||p.before||"";
const card=p=>`<article class="seo-project-card"><a href="/realisations.html"><img src="/${image(p)}" alt="${esc(p.title)} – réalisation AWZ-Rénovation" loading="lazy" width="1200" height="800"><p>${esc(p.label)}</p><h3>${esc(p.title)}</h3><p>${esc(p.copy)}</p></a></article>`;
export function injectProjectFallback(file,text,projects,isCity=false){
 if(file==="index.html"){const p=projects.find(x=>x.mode==="compare")||projects[0];return text.replace('<div id="home-project" class="mt-10"></div>',`<div id="home-project" class="mt-10">${card(p)}</div>`);}
 if(file==="realisations.html") return text.replace('<section id="featured-projects" class="featured-project mt-10 space-y-10 lg:space-y-14"></section>',`<section id="featured-projects" class="featured-project mt-10 space-y-10 lg:space-y-14">${projects.map(card).join("")}</section>`);
 if(isCity) return text.replace('<div id="city-projects" class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>',`<div id="city-projects" class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">${projects.slice(0,3).map(card).join("")}</div>`);
 return text;
}
