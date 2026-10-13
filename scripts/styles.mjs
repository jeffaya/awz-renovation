import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import postcss from "postcss";
import tailwind from "tailwindcss";
import cssnano from "cssnano";

export async function buildStyles(pages) {
  mkdirSync("dist/assets/css", { recursive: true });
  const content = [...pages.values()].join("\n");
  const utilities = await postcss([
    tailwind({
      content: [{ raw: content, extension: "html" }],
      theme: { extend: { colors: { awz: "#14362e", sand: "#f4f0e7", stone2: "#d9cfbf" } } },
    }),
    cssnano({ preset: "default" }),
  ]).process("@tailwind base;\n@tailwind components;\n@tailwind utilities;", { from: undefined });
  writeFileSync("dist/assets/css/utilities.css", utilities.css);

  // Keep only icon selectors used by the generated pages, with the same pinned font.
  const icons = postcss.parse(
    readFileSync("node_modules/bootstrap-icons/font/bootstrap-icons.css", "utf8"),
  );
  const usedIcons = new Set(content.match(/\bbi-[a-z0-9-]+\b/g));
  icons.walkRules((rule) => {
    const name = rule.selector.match(/^\.(bi-[a-z0-9-]+)::before$/)?.[1];
    if (name && !usedIcons.has(name)) rule.remove();
  });
  const styles = await postcss([cssnano({ preset: "default" })]).process(
    `${icons}\n${readFileSync("assets/css/styles.css", "utf8")}`,
    { from: undefined },
  );
  writeFileSync("dist/assets/css/styles.css", styles.css);
  cpSync("node_modules/bootstrap-icons/font/fonts", "dist/assets/css/fonts", { recursive: true });
  cpSync("node_modules/bootstrap-icons/LICENSE", "dist/assets/css/bootstrap-icons-LICENSE.txt");
}
