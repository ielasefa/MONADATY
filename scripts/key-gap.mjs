// Extracts translation keys used in code and compares against seed-translations.ts
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const files = execSync('find app components context hooks -name "*.tsx" -not -path "*/node_modules/*"', { encoding: "utf8" }).trim().split("\n");
const seed = readFileSync("prisma/seed-translations.ts", "utf8");

// seed keys: {ns, key}
const seedKeys = new Set();
for (const m of seed.matchAll(/key:\s*"([^"]+)",\s*namespace:\s*"([^"]+)"/g)) {
  seedKeys.add(`${m[2]}.${m[1]}`);
}
for (const m of seed.matchAll(/namespace:\s*"([^"]+)",\s*key:\s*"([^"]+)"/g)) {
  seedKeys.add(`${m[1]}.${m[2]}`);
}

const used = new Map(); // "ns.key" -> {fallbackCount, noFallbackCount, files:Set}
const NS_RE = /useTranslation\(\s*"([a-z_]+)"\s*\)/g;

for (const f of files) {
  let src;
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  // determine default namespace for file
  const nsMatch = [...src.matchAll(NS_RE)];
  const ns = nsMatch.length ? nsMatch[0][1] : "common";
  // t("key") / t("key", "fallback") / t("key", {...})
  const TR = /[^a-zA-Z]t\(\s*"([a-zA-Z0-9_.]+)"\s*(?:,\s*("(?:[^"\\]|\\.)*"|\{[^}]*\}))?/g;
  for (const m of src.matchAll(TR)) {
    const key = m[1];
    if (key.includes(".")) continue; // dot = fully qualified, rare
    const id = `${ns}.${key}`;
    const withFb = Boolean(m[2]);
    if (!used.has(id)) used.set(id, { fb: 0, nfb: 0, files: new Set() });
    const rec = used.get(id);
    if (withFb) rec.fb++; else rec.nfb++;
    rec.files.add(f);
  }
  // server pattern: t(translations, "key", lang) — skip if loadTranslations present (handled below)
  const hasLoads = /loadTranslations\(\s*"([a-z_]+)"\s*\)/.test(src);
  if (!hasLoads) {
    const SR = /[^a-zA-Z](?:t|getTranslation)\(\s*[a-zA-Z_]+,\s*"([a-zA-Z0-9_.]+)"\s*,/g;
    for (const m of src.matchAll(SR)) {
      const key = m[1];
      if (key.includes(".")) continue;
      const id = `${ns}.${key}`;
      if (!used.has(id)) used.set(id, { fb: 1, nfb: 0, files: new Set() }); // server has fallback arg pattern
      else used.get(id).fb++;
      used.get(id).files.add(f);
    }
  }
}

// server components with loadTranslations("ns")
for (const f of files) {
  let src;
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  const loads = [...src.matchAll(/loadTranslations\(\s*"([a-z_]+)"\s*\)/g)];
  const SR = /[^a-zA-Z](?:t|getTranslation)\(\s*[a-zA-Z_]+,\s*"([a-zA-Z0-9_.]+)"\s*,/g;
  for (const mm of src.matchAll(SR)) {
    const key = mm[1];
    if (key.includes(".")) continue;
    for (const m of loads) {
      const id = `${m[1]}.${key}`;
      if (!used.has(id)) used.set(id, { fb: 1, nfb: 0, files: new Set() });
      else used.get(id).fb++;
      used.get(id).files.add(f);
    }
  }
}

const missingNoFb = [...used.entries()].filter(([id, r]) => r.nfb > 0 && !seedKeys.has(id));
const missingWithFb = [...used.entries()].filter(([id, r]) => r.fb > 0 && !seedKeys.has(id));

console.log(`Unique keys used: ${used.size}`);
console.log(`Seeded keys: ${seedKeys.size}`);
console.log(`\n--- Missing NO fallback (renders raw key) : ${missingNoFb.length} ---`);
for (const [id, r] of missingNoFb.sort()) console.log(`  ${id}  (nfb:${r.nfb}) ${[...r.files].join(", ")}`);
console.log(`\n--- Missing WITH fallback : ${missingWithFb.length} ---`);
for (const [id] of missingWithFb.sort()) console.log(`  ${id}`);
