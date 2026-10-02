import { cpSync,mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync } from "node:fs";
import { site,cities } from "./config.mjs";
import { buildProjects } from "./projects.mjs";
import { renderCity,renderPartials } from "./pages.mjs";
import { injectProjectFallback } from "./seo.mjs";
const projects=buildProjects();
rmSync("dist",{recursive:true,force:true}); mkdirSync("dist");
const staticPages=readdirSync(".").filter(f=>f.endsWith(".html"));
for(const f of staticPages){
 let html=renderPartials(readFileSync(f,"utf8"));
 html=injectProjectFallback(f,html,projects,false);
 writeFileSync(`dist/${f}`,html);
}
for(const city of cities){
 let html=renderCity(city);
 html=injectProjectFallback(city.file,html,projects,true);
 writeFileSync(`dist/${city.file}`,html);
}
cpSync("assets","dist/assets",{recursive:true});
const urls=[...staticPages.filter(f=>!["merci.html"].includes(f)),...cities.map(c=>c.file)];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(f=>`  <url><loc>${site.siteUrl}/${f==="index.html"?"":f}</loc></url>`).join("\n")}\n</urlset>\n`;
writeFileSync("dist/sitemap.xml",sitemap);
writeFileSync("dist/robots.txt",`User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
console.log(`Build OK: ${projects.length} réalisations, ${cities.length} villes, ${staticPages.length} pages statiques.`);
