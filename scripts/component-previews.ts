import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { componentInventory } from "./component-inventory";
import Handlebars from "handlebars";

const source = resolve(import.meta.dir, "../site");
export const componentPreviewHref = (name: string) =>
  `component--${name.replaceAll("/", "--")}.html`;
export function previewComponentName(pageName: string): string | null {
  if (!/^component--[a-z0-9-]+$/.test(pageName)) return null;
  const name = pageName.slice("component--".length).replaceAll("--", "/");
  return existsSync(join(source, "partials", `${name}.hbs`)) ? name : null;
}

export function renderComponentPreview(
  name: string,
  hbs: typeof Handlebars,
): string {
  const inventory = componentInventory();
  const item = inventory.groups
    .flatMap((group) => group.components)
    .find((item) => item.name === name);
  if (!item) throw new Error(`Unknown component: ${name}`);
  const preferredPage = name.startsWith("headers/")
    ? item.usedBy.find((page) => page.href.startsWith("header-preview-"))
    : undefined;
  const sample = preferredPage || item.usedBy[0];
  if (!sample) throw new Error(`No example composition for ${name}`);
  const page = JSON.parse(
    readFileSync(
      join(source, "pages", sample.href.replace(".html", ".json")),
      "utf8",
    ),
  );
  const partialText = (component: string) =>
    readFileSync(join(source, "partials", `${component}.hbs`), "utf8");
  function includes(
    component: string,
    target: string,
    seen = new Set<string>(),
  ): boolean {
    if (component === target) return true;
    if (seen.has(component)) return false;
    seen.add(component);
    return [...partialText(component).matchAll(/{{>\s+([\w/-]+)/g)].some(
      (match) => includes(match[1], target, seen),
    );
  }
  const block = page.sections.find((block: { component: string }) =>
    includes(block.component, name),
  );
  const context = {
    ...page,
    ...block?.data,
    inventory,
    currentPage: sample.href,
    site: JSON.parse(readFileSync(join(source, "data/site.json"), "utf8")),
    stylesheets: [
      ...new Set([
        ...page.stylesheets,
        "assets/css/partials/page-headers.css",
        "assets/css/partials/layout.css",
        "assets/css/partials/microinteractions.css",
      ]),
    ],
    scripts: [
      ...new Set([
        ...page.scripts,
        "assets/js/partials/header-video.js",
        "assets/js/partials/microinteractions.js",
      ]),
    ],
  };
  let content = hbs.compile(partialText(name))(context);
  let note =
    "Rendered from the actual partial with content from its example page.";
  if (name === "headers/copy") {
    content = `<section class="page-header header-editorial" style="--header-accent:${hbs.escapeExpression(context.colour)}"><div class="header-stage wrap">${content}</div></section>`;
    note = "The copy partial is shown inside its header styling context.";
  } else if (name === "headers/caption") {
    content = `<section class="page-header" style="--header-accent:${hbs.escapeExpression(context.colour)}">${content}</section>`;
  } else if (name === "shared/head") {
    content = `<section class="section wrap"><h1>Document head</h1><p>This partial supplies metadata, styles and scripts. Its rendered markup is shown below.</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px">${hbs.escapeExpression(content)}</pre></section>`;
    note =
      "This is a nonvisual document partial; the preview displays its rendered markup.";
  }
  const head = hbs.compile(partialText("shared/head"))(context);
  const canvas = `<!doctype html><html lang="en-GB">${head}<body data-microinteractions class="${hbs.escapeExpression(page.bodyClass || "")}" style="${hbs.escapeExpression(page.bodyStyle || "")}"><main style="min-height:100svh" id="${hbs.escapeExpression(page.mainId)}">${content}</main></body></html>`;
  return hbs.compile(
    readFileSync(join(source, "layouts/component-preview.hbs"), "utf8"),
  )({ name, canvas, note, pageHref: sample.href, pageTitle: sample.title });
}
