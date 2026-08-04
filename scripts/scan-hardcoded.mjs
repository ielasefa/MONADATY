// Scans TSX files for likely hardcoded user-facing strings:
// 1. Bare JSX text nodes (letters/words directly in JSX, excluding known noise)
// 2. Common user-facing props: placeholder/aria-label/title/alt/label with string literals
// 3. Sonner toast() calls with string literals
// Usage: node scripts/scan-hardcoded.mjs [path...]
import { readFileSync } from "fs";
import { execSync } from "child_process";

const files = process.argv.slice(2);
if (files.length === 0) {
  const list = execSync('find app components context hooks -name "*.tsx" -not -path "*/node_modules/*"', { encoding: "utf8" });
  files.push(...list.trim().split("\n"));
}

const TAGGED = /<(?:[^>]*)\s(placeholder|aria-label|title|alt|label|description|helperText|hint|name)\s*=\s*(?:t\(|getTranslation\()/;
const PROP = /(placeholder|aria-label|title|alt|label)\s*=\s*"([^"]{2,})"/g;
const TEXT_NODE = />\s*([A-ZÀ-ÿ][^<>{}]{1,80}?)\s*</g;
const TOAST = /(?:toast|sonnerToast|showToast)\.(?:error|success|info|warning|message)?\(?\s*"([^"]{2,})"/g;

for (const f of files) {
  let src;
  try {
    src = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const lines = src.split("\n");
  const hits = [];

  lines.forEach((line, i) => {
    // string-literal props
    for (const m of line.matchAll(PROP)) {
      const [full, prop, val] = m;
      if (val.includes("{") || val.includes("}")) continue;
      if (/\b(after|before|content)\b/.test(prop)) continue;
      if (/^\s*\/\/|\*\//.test(line)) continue;
      hits.push({ i: i + 1, kind: `prop:${prop}`, text: val });
    }
    // JSX text nodes
    for (const m of line.matchAll(TEXT_NODE)) {
      const val = m[1].trim();
      if (!val) continue;
      if (/^[a-zA-Z0-9_]+$/.test(val) && !/[A-ZÀ-ÿ]/.test(val[0])) continue; // identifiers
      if (/^\d+$/.test(val)) continue;
      hits.push({ i: i + 1, kind: "text", text: val });
    }
    // toasts
    for (const m of line.matchAll(TOAST)) {
      hits.push({ i: i + 1, kind: "toast", text: m[2] });
    }
  });

  if (hits.length > 0) {
    console.log(`\n=== ${f} (${hits.length}) ===`);
    for (const h of hits.slice(0, 60)) {
      console.log(`  ${h.i}: [${h.kind}] ${JSON.stringify(h.text)}`);
    }
    if (hits.length > 60) console.log(`  ... +${hits.length - 60} more`);
  }
}
