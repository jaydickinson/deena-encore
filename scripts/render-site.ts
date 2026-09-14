import {
  previewComponentName,
  renderComponentPreview,
  componentPreviewHref,
} from "./component-previews";
import { componentInventory } from "./component-inventory";
import {
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, join, relative, resolve, basename } from "node:path";
import Handlebars from "handlebars";

// Handlebars runs only at build/dev time. The browser receives complete HTML.
const projectRoot = resolve(import.meta.dir, "..");
const sourceRoot = join(projectRoot, "site");
export const pagesRoot = join(sourceRoot, "pages");

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? filesIn(join(directory, entry.name))
        : [join(directory, entry.name)],
    )
    .sort();
}

function engine() {
  const hbs = Handlebars.create();
  hbs.registerHelper("eq", (a, b) => a === b);
  const partialRoot = join(sourceRoot, "partials");
  for (const path of filesIn(partialRoot).filter((path) =>
    path.endsWith(".hbs"),
  )) {
    hbs.registerPartial(
      relative(partialRoot, path).replace(/\.hbs$/, ""),
      readFileSync(path, "utf8"),
    );
  }
  return hbs;
}

export function pageNames(): string[] {
  return readdirSync(pagesRoot)
    .filter((name) => name.endsWith(".json"))
    .map((name) => basename(name, ".json"))
    .sort();
}

export function hasPage(name: string): boolean {
  return (
    Boolean(previewComponentName(name)) ||
    (/^[a-z0-9-]+$/.test(name) && existsSync(join(pagesRoot, `${name}.json`)))
  );
}

export function renderPage(name: string, hbs = engine()): string {
  const component = previewComponentName(name);
  if (component) return renderComponentPreview(component, hbs);
  if (!hasPage(name)) throw new Error(`Unknown page: ${name}`);
  const page = JSON.parse(
    readFileSync(join(pagesRoot, `${name}.json`), "utf8"),
  );
  if (!["default", "homepage", "preview"].includes(page.layout))
    throw new Error(`Unknown layout in ${name}`);
  if (!Array.isArray(page.sections))
    throw new Error(`Missing sections in ${name}`);
  for (const section of page.sections) {
    if (!Object.hasOwn(hbs.partials, section.component))
      throw new Error(`Missing partial ${section.component} in ${name}`);
  }
  const headers = page.sections.filter((section: { component: string }) =>
    [
      "headers/image",
      "headers/split",
      "headers/video",
      "headers/split-video",
      "headers/editorial",
      "headers/parallax",
    ].includes(section.component),
  );
  for (const header of headers) {
    const required = ["title", "colour"];
    if (header.component !== "headers/editorial")
      required.push("image", "imageAlt", "focalPoint");
    if (["headers/video", "headers/split-video"].includes(header.component))
      required.push("video");
    if (header.data?.ctaLabel) required.push("ctaHref");
    if (header.data?.backLabel) required.push("backHref");
    for (const field of required) {
      if (
        typeof header.data?.[field] !== "string" ||
        !header.data[field].trim()
      )
        throw new Error(`Missing ${field} for ${header.component} in ${name}`);
    }
  }
  if (headers.length)
    page.stylesheets = [
      ...new Set([...page.stylesheets, "assets/css/partials/page-headers.css"]),
    ];
  if (
    headers.some(
      (header: { component: string; data?: { video?: string } }) =>
        ["headers/video", "headers/split-video"].includes(header.component) ||
        (header.component === "headers/parallax" && header.data?.video),
    )
  )
    page.scripts = [
      ...new Set([...page.scripts, "assets/js/partials/header-video.js"]),
    ];
  if (
    headers.some(
      (header: { component: string }) =>
        header.component === "headers/parallax",
    )
  )
    page.scripts = [
      ...new Set([...page.scripts, "assets/js/partials/header-parallax.js"]),
    ];
  page.stylesheets = [
    ...new Set([
      ...page.stylesheets,
      "assets/css/partials/layout.css",
      "assets/css/partials/microinteractions.css",
    ]),
  ];
  page.scripts = [
    ...new Set([...page.scripts, "assets/js/partials/microinteractions.js"]),
  ];
  const template = readFileSync(
    join(sourceRoot, "layouts", `${page.layout}.hbs`),
    "utf8",
  );
  return (
    "<!-- Generated from site/pages/" +
    name +
    ".json; edit source partials, not this file. -->\n" +
    hbs.compile(template)({
      ...page,
      inventory:
        name === "component-library" ? componentInventory() : undefined,
      currentPage: `${name}.html`,
      recentShowsCurrent:
        name === "case-studies"
          ? "page"
          : page.sections.some(
                (section: {
                  data?: { breadcrumb?: { parents?: { href: string }[] } };
                }) =>
                  section.data?.breadcrumb?.parents?.some(
                    (parent) => parent.href === "case-studies.html",
                  ),
              )
            ? "location"
            : undefined,
      site: JSON.parse(
        readFileSync(join(sourceRoot, "data/site.json"), "utf8"),
      ),
    })
  );
}

export function renderSite(destination: string): void {
  const hbs = engine();
  // Render everything first: an invalid partial must fail before writing any pages.
  const rendered = pageNames().map((name) => [name, renderPage(name, hbs)]);
  for (const item of componentInventory().groups.flatMap(
    (group) => group.components,
  )) {
    rendered.push([
      componentPreviewHref(item.name).replace(/\.html$/, ""),
      renderComponentPreview(item.name, hbs),
    ]);
  }
  for (const [name, html] of rendered) {
    const path = join(destination, `${name}.html`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, html);
  }
  console.log(
    `Rendered ${rendered.length} pages from site/ into ${destination}/`,
  );
}

if (import.meta.main) renderSite(process.argv[2] || "mockups");
