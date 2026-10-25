import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const categories = new Set([
  "maconnerie",
  "interieur",
  "pierre",
  "facades",
  "terrasses",
  "finitions",
]);
const numbered = /^(\d+)\.webp$/;

export function buildProjects(root = "assets/images/realisations") {
  const source = JSON.parse(readFileSync(join(root, "projects.json"), "utf8"));
  if (!Array.isArray(source)) throw new Error("projects.json doit contenir un tableau.");
  const seen = new Set();
  return source
    .map((meta) => {
      for (const key of ["date", "category", "label", "title", "description"]) {
        if (typeof meta[key] !== "string" || !meta[key].trim())
          throw new Error(`Projet: champ ${key} manquant ou vide`);
      }
      const parsed = new Date(`${meta.date}T00:00:00.000Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(meta.date) ||
        Number.isNaN(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== meta.date ||
        seen.has(meta.date)
      )
        throw new Error(`${meta.date}: date invalide ou dupliquée`);
      seen.add(meta.date);
      if (!categories.has(meta.category))
        throw new Error(`${meta.date}: catégorie inconnue ${meta.category}`);
      if (
        !Array.isArray(meta.points) ||
        meta.points.some((point) => typeof point !== "string" || !point.trim())
      )
        throw new Error(`${meta.date}: points doit contenir des textes non vides`);
      for (const key of ["city", "context", "duration", "surface"]) {
        if (meta[key] !== undefined && (typeof meta[key] !== "string" || !meta[key].trim()))
          throw new Error(`${meta.date}: ${key} doit être un texte non vide`);
      }
      for (const key of ["materials", "workDetails"]) {
        if (
          meta[key] !== undefined &&
          (!Array.isArray(meta[key]) ||
            meta[key].some((value) => typeof value !== "string" || !value.trim()))
        )
          throw new Error(`${meta.date}: ${key} doit contenir des textes non vides`);
      }
      const dir = join(root, meta.date);
      if (!existsSync(dir)) throw new Error(`${meta.date}: répertoire manquant`);
      const names = readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name);
      const before = names.includes("avant.webp"),
        after = names.includes("apres.webp");
      if (before !== after)
        throw new Error(`${meta.date}: avant.webp et apres.webp doivent être présents ensemble`);
      const numbers = names
        .filter((name) => numbered.test(name))
        .sort((a, b) => Number(a.match(numbered)[1]) - Number(b.match(numbered)[1]));
      if (!before && !numbers.length) throw new Error(`${meta.date}: aucune image trouvée`);
      const base = `assets/images/realisations/${meta.date}`;
      return {
        id: meta.date,
        file: `realisation-${meta.date}.html`,
        date: meta.date,
        cat: meta.category,
        label: meta.label,
        title: meta.title,
        copy: meta.description,
        points: meta.points,
        ...Object.fromEntries(
          ["city", "context", "duration", "surface", "materials", "workDetails"]
            .filter((key) => meta[key] !== undefined)
            .map((key) => [key, meta[key]]),
        ),
        mode: before ? "compare" : "gallery",
        ...(before
          ? {
              before: `${base}/avant.webp`,
              after: `${base}/apres.webp`,
              gallery: numbers.map((name) => `${base}/${name}`),
            }
          : { images: numbers.map((name) => `${base}/${name}`) }),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
