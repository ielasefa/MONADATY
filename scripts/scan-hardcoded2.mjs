// Second-pass scanner: toasts, alerts/confirms, option arrays, metadata, EmptyState props,
// document.title, template-literal user-facing strings, label:"..." objects.
import { readFileSync } from "fs";
import { execSync } from "child_process";

let files = process.argv.slice(2);
if (files.length === 0) {
  const list = execSync('find app components context hooks -name "*.tsx" -not -path "*/node_modules/*"', { encoding: "utf8" });
  files = list.trim().split("\n");
}

// patterns: (kind, regex) — captures at least one quoted string
const PATTERNS = [
  ["toast", /toast\.(?:error|success|info|warning|message|promise)?\(?\s*(["'`])([^"'`]{2,120}?)\1/g],
  ["toast2", /(?:toast|sonnerToast)\s*\(\s*(["'`])([^"'`]{2,120}?)\1/g],
  ["dialog", /\b(?:alert|confirm|prompt)\(\s*(["'`])([^"'`]{2,120}?)\1/g],
  ["option", /<option[^>]*>([^<>{}]{2,80})<\/option>/g],
  ["metadata", /\b(title|description):\s*["'`]([^"'`]{2,120})["'`]/g],
  ["emptystate", /<EmptyState[^>]*(title|description|message)\s*=\s*["'`]([^"'`]{2,120})["'`]/g],
  ["docTitle", /document\.title\s*=\s*(["'`])([^"'`]{2,120}?)\1/g],
  ["linkLabel", /<Link[^>]*>(?:aria-label|title)\s*=\s*["'`]([^"'`]{2,120})["'`]/g],
];

for (const f of files) {
  let src;
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  const lines = src.split("\n");
  const hits = [];
  lines.forEach((line, i) => {
    if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) return;
    for (const [kind, re] of PATTERNS) {
      for (const m of line.matchAll(re)) {
        const val = m[2] ?? m[1];
        if (!val || val.length < 2) continue;
        if (/^[\d\s%.-]+$/.test(val)) continue;
        if (val.startsWith("${") || val.includes("{count}")) continue;
        hits.push({ i: i + 1, kind, text: val });
      }
    }
  });
  if (hits.length) {
    console.log(`\n=== ${f} (${hits.length}) ===`);
    for (const h of hits.slice(0, 80)) console.log(`  ${h.i}: [${h.kind}] ${JSON.stringify(h.text)}`);
    if (hits.length > 80) console.log(`  ... +${hits.length - 80} more`);
  }
}
