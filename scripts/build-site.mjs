import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";

const files = ["robots.txt", "sitemap.xml"];
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const f of readdirSync(".")) if (f.endsWith(".html")) files.push(f);
for (const f of files) cpSync(f, `dist/${f}`);
cpSync("assets", "dist/assets", { recursive: true });
console.log(`Copied ${files.length} files and assets/ to dist/`);
