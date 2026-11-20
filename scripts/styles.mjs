import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import postcss from "postcss";
import tailwind from "tailwindcss";
import cssnano from "cssnano";

export async function buildStyles(pages) {
  mkdirSync("dist/assets/css", { recursive: true });
  const classNames = new Set();
  for (const html of pages.values()) {
    for (const match of html.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      for (const name of (match[1] ?? match[2] ?? match[3]).split(/\s+/)) classNames.add(name);
    }
  }
  const utilities = await postcss([
    tailwind({
      content: [{ raw: [...classNames].join(" "), extension: "html" }],
      theme: { extend: { colors: { awz: "#14362e", sand: "#f4f0e7" } } },
    }),
    cssnano({ preset: "default" }),
  ]).process("@tailwind base;\n@tailwind components;\n@tailwind utilities;", { from: undefined });
  writeFileSync("dist/assets/css/utilities.css", utilities.css);

  // Keep only icon selectors used by the generated pages, with the same pinned font.
  const icons = postcss.parse(
    readFileSync("node_modules/bootstrap-icons/font/bootstrap-icons.css", "utf8"),
  );
  icons.walkRules((rule) => {
    const name = rule.selector.match(/^\.(bi-[a-z0-9-]+)::before$/)?.[1];
    if (name && !classNames.has(name)) rule.remove();
  });
  const styles = await postcss([cssnano({ preset: "default" })]).process(
    `${icons}\n${readFileSync("assets/css/styles.css", "utf8")}`,
    { from: undefined },
  );
  writeFileSync("dist/assets/css/styles.css", styles.css);
  cpSync("node_modules/bootstrap-icons/font/fonts", "dist/assets/css/fonts", { recursive: true });
  cpSync("node_modules/bootstrap-icons/LICENSE", "dist/assets/css/bootstrap-icons-LICENSE.txt");
}
