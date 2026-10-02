import { existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync } from "node:fs";
import { join } from "node:path";
const root="assets/images/realisations", datePattern=/^\d{4}-\d{2}-\d{2}$/, numbered=/^(\d+)\.webp$/;
export function buildProjects(){
 const source=JSON.parse(readFileSync(join(root,"projects.json"),"utf8")); if(!Array.isArray(source)) throw new Error("projects.json doit contenir un tableau.");
 const seen=new Set();
 const projects=source.map(meta=>{
  for(const key of ["date","category","label","title","description","points"]) if(meta[key]==null) throw new Error(`Projet: champ ${key} manquant`);
  if(!datePattern.test(meta.date)||seen.has(meta.date)) throw new Error(`${meta.date}: date invalide ou dupliquée`); seen.add(meta.date);
  const dir=join(root,meta.date); if(!existsSync(dir)) throw new Error(`${meta.date}: répertoire manquant`);
  const names=readdirSync(dir),before=names.includes("avant.webp"),after=names.includes("apres.webp");
  if(before!==after) throw new Error(`${meta.date}: avant.webp et apres.webp doivent être présents ensemble`);
  const nums=names.filter(n=>numbered.test(n)).sort((a,b)=>+a.match(numbered)[1]-+b.match(numbered)[1]);
  if(!before&&!nums.length) throw new Error(`${meta.date}: aucune image trouvée`);
  const base=`assets/images/realisations/${meta.date}`;
  return {id:meta.date,date:meta.date,cat:meta.category,label:meta.label,title:meta.title,copy:meta.description,points:meta.points,
   mode:before?"compare":"gallery",...(before?{before:`${base}/avant.webp`,after:`${base}/apres.webp`,gallery:nums.map(n=>`${base}/${n}`)}:{images:nums.map(n=>`${base}/${n}`)})};
 }).sort((a,b)=>b.date.localeCompare(a.date));
 mkdirSync("assets/js",{recursive:true});
 writeFileSync("assets/js/projects.js",`// GENERATED — edit projects.json\nwindow.AWZ_PROJECTS=${JSON.stringify(projects)};\nwindow.AWZ_PROJECT_BY_ID=Object.fromEntries(window.AWZ_PROJECTS.map(p=>[p.id,p]));\nwindow.AWZ_PROJECT_IMAGE=p=>p.after||((p.images||[])[0])||p.before||'';\n`);
 return projects;
}
