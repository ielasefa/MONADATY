// Merges JSON key arrays into prisma/seed-translations.ts (dedupes by key+namespace)
import { readFileSync, writeFileSync, existsSync } from "fs";

const seedPath = "prisma/seed-translations.ts";
const seed = readFileSync(seedPath, "utf8");

const existing = new Set();
for (const m of seed.matchAll(/key:\s*"([^"]+)",\s*namespace:\s*"([^"]+)"/g)) existing.add(`${m[2]}.${m[1]}`);
for (const m of seed.matchAll(/namespace:\s*"([^"]+)",\s*key:\s*"([^"]+)"/g)) existing.add(`${m[1]}.${m[2]}`);

const files = process.argv.slice(2);
let added = 0;
let skipped = 0;
const chunks = [];

for (const f of files) {
  if (!existsSync(f)) continue;
  const entries = JSON.parse(readFileSync(f, "utf8"));
  for (const e of entries) {
    const id = `${e.namespace}.${e.key}`;
    if (existing.has(id)) { skipped++; continue; }
    if (!e.fr || !e.en || !e.ar) { console.error(`EMPTY FIELD: ${id}`); process.exit(1); }
    chunks.push(`{ key: ${JSON.stringify(e.key)}, namespace: ${JSON.stringify(e.namespace)}, fr: ${JSON.stringify(e.fr)}, en: ${JSON.stringify(e.en)}, ar: ${JSON.stringify(e.ar)} },`);
    existing.add(id);
    added++;
  }
}

if (chunks.length) {
  const insert = `\n// ── Audit-generated keys ──\n${chunks.join("\n")}\n`;
  const idx = seed.lastIndexOf("];");
  const out = seed.slice(0, idx) + insert + seed.slice(idx);
  writeFileSync(seedPath, out);
}
console.log(`Added: ${added} | Skipped (already present): ${skipped}`);
