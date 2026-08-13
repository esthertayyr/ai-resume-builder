// Bundles the entire site UI into one Markdown file for handing to another tool
// (e.g. ChatGPT). Concatenates design tokens, global styles, the root layout,
// every page, and every component — each in a fenced block headed by its path.
// Run: node scripts/make-ui-snapshot.mjs  → writes UI-SNAPSHOT.md at the repo root.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const UI_EXTS = new Set([".tsx", ".ts", ".css"]);
const fence = (ext) =>
  ext === ".css" ? "css" : ext === ".ts" ? "ts" : "tsx";

// Explicit, ordered set of source roots that make up the visible UI.
const files = [
  "tailwind.config.ts",
  "app/globals.css",
  "app/layout.tsx",
  ...walk(join(ROOT, "app")).filter((f) => f.endsWith(".tsx") && !f.endsWith("layout.tsx")),
  ...walk(join(ROOT, "components")).filter((f) => UI_EXTS.has(extname(f))),
]
  .map((f) => (f.startsWith(ROOT) ? relative(ROOT, f) : f))
  // de-dupe while preserving order
  .filter((f, i, arr) => arr.indexOf(f) === i);

let md = `# The Annotated Career — Full UI Snapshot\n\n`;
md += `Generated bundle of the entire site UI: design tokens, global styles, the\n`;
md += `root layout, every page, and every component. ${files.length} files.\n\n`;
md += `## File index\n\n`;
for (const f of files) md += `- ${f}\n`;
md += `\n---\n\n`;

let total = 0;
for (const f of files) {
  let body;
  try {
    body = readFileSync(join(ROOT, f), "utf8");
  } catch {
    continue;
  }
  total += body.split("\n").length;
  md += `## ${f}\n\n\`\`\`${fence(extname(f))}\n${body.replace(/\n$/, "")}\n\`\`\`\n\n`;
}

writeFileSync(join(ROOT, "UI-SNAPSHOT.md"), md, "utf8");
console.log(`Wrote UI-SNAPSHOT.md — ${files.length} files, ${total} lines of UI source.`);
