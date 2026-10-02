import { readFileSync } from "node:fs";
import { site,replaceTokens } from "./config.mjs";
const partials={
 PARTIAL_HEADER:readFileSync("templates/partials/header.html","utf8"),
 PARTIAL_FOOTER:readFileSync("templates/partials/footer.html","utf8"),
 PARTIAL_MOBILE_CTA:readFileSync("templates/partials/mobile-cta.html","utf8")
};
export function renderPartials(text){
 const resolvedPartials=Object.fromEntries(
   Object.entries(partials).map(([key,value])=>[key,replaceTokens(value)])
 );
 return replaceTokens(text,resolvedPartials);
}
export function renderCity(city){
 let t=readFileSync("templates/pages/city.html","utf8");
 const paras=(city.localParagraphs||[]).map((p,i)=>`<p class="mt-${i?4:6} max-w-2xl leading-7 text-slate-600">${p}</p>`).join("");
 return renderPartials(replaceTokens(t,{
  CITY_TITLE:city.title,CITY_DESCRIPTION:city.description,CITY_CANONICAL:`${site.siteUrl}/${city.file}`,
  CITY_HERO_IMAGE:city.heroImage,CITY_HERO_ALT:city.heroAlt,CITY_HERO_TITLE:city.heroTitle,
  CITY_HERO_COPY:city.heroCopy,CITY_LOCAL_TITLE:city.localTitle,CITY_LOCAL_PARAGRAPHS:paras
 }));
}
