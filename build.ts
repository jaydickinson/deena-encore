import { renderSite } from "./scripts/render-site";
import { cpSync, rmSync, existsSync } from "node:fs";

// Build a self-contained static bundle in dist/ that can be uploaded anywhere
// Current page designs are rendered from site/; earlier concepts stay standalone.

const src = "mockups";
const out = "dist";

// Files that only matter during local development and should not ship.
const exclude = new Set(["serve.ts"]);

if (existsSync(out)) rmSync(out, { recursive: true, force: true });

cpSync(src, out, {
  recursive: true,
  filter(source) {
    const name = source.slice(src.length + 1);
    return !exclude.has(name);
  },
});

renderSite(out);

console.log(
  `Built ${out}/ from ${src}/ - upload the dist/ folder to any static host.`,
);
