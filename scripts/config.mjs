import { readFileSync } from "node:fs";
export const artisan=JSON.parse(readFileSync("assets/config/artisan.json","utf8"));
export const site=JSON.parse(readFileSync("assets/config/site.json","utf8"));
if(!site.siteUrl) throw new Error("site.json: champ siteUrl manquant");
site.siteUrl=site.siteUrl.replace(/\/$/,"");
for(const key of ["name","phone","phoneHref","email","address","postalCode","city","siret","artisanFirstName","artisanLastName","artisanFullName"]){
  if(!artisan[key]) throw new Error(`artisan.json: champ ${key} manquant`);
}
export const cities=JSON.parse(readFileSync("assets/config/cities.json","utf8"));
export function replaceTokens(text,values={}){
  const fullAddress=`${artisan.address}, ${artisan.postalCode} ${artisan.city}`;
  const base={
    ARTISAN_NAME:artisan.name,ARTISAN_PHONE:artisan.phone,ARTISAN_PHONE_HREF:artisan.phoneHref,
    ARTISAN_EMAIL:artisan.email,ARTISAN_ADDRESS:artisan.address,
    ARTISAN_ADDRESS_HTML:`${artisan.address}<br>${artisan.postalCode} ${artisan.city}`,
    ARTISAN_FULL_ADDRESS:fullAddress,ARTISAN_SIRET:artisan.siret,SITE_URL:site.siteUrl,
    ARTISAN_FIRST_NAME:artisan.artisanFirstName,ARTISAN_LAST_NAME:artisan.artisanLastName,
    ARTISAN_FULL_NAME:artisan.artisanFullName,
    ARTISAN_MAILTO:`mailto:${artisan.email}?subject=${encodeURIComponent("Demande de devis – "+artisan.name)}`,
    ...values
  };
  for(const [k,v] of Object.entries(base)) text=text.split(`{{${k}}}`).join(String(v));
  return text;
}
