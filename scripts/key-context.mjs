// Dumps missing keys with fallback + source context line for manual translation
import { readFileSync } from "fs";
import { execSync } from "child_process";

const files = execSync('find app components context hooks -name "*.tsx" -not -path "*/node_modules/*"', { encoding: "utf8" }).trim().split("\n");
const seed = readFileSync("prisma/seed-translations.ts", "utf8");

const seedKeys = new Set();
for (const m of seed.matchAll(/key:\s*"([^"]+)",\s*namespace:\s*"([^"]+)"/g)) seedKeys.add(`${m[2]}.${m[1]}`);
for (const m of seed.matchAll(/namespace:\s*"([^"]+)",\s*key:\s*"([^"]+)"/g)) seedKeys.add(`${m[1]}.${m[2]}`);

const used = new Map();

function note(ns, key, line, fb) {
  if (key.includes(".")) return;
  const id = `${ns}.${key}`;
  if (!used.has(id)) used.set(id, { fb: undefined, fbSet: false, nfb: 0, samples: [] });
  const rec = used.get(id);
  if (fb !== undefined && !rec.fbSet) { rec.fb = fb; rec.fbSet = true; }
  if (fb === undefined) rec.nfb++;
  if (rec.samples.length < 2) rec.samples.push(line.trim().slice(0, 180));
}

for (const f of files) {
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n");
  const nsMatch = [...src.matchAll(/useTranslation\(\s*"([a-z_]+)"\s*\)/g)];
  const defNs = nsMatch.length ? nsMatch[0][1] : "common";
  const lineNs = new Array(lines.length).fill(defNs);
  for (const m of src.matchAll(/loadTranslations\(\s*"([a-z_]+)"\s*\)/g)) {
    // server files: t(translations, ...) uses that ns — apply to whole file
    for (let i = 0; i < lines.length; i++) lineNs[i] = m[1];
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // client: t("key", "fb") or t("key", {..})
    const CR = /[^a-zA-Z]t\(\s*"([a-zA-Z0-9_]+)"\s*(?:,\s*("(?:[^"\\]|\\.)*"|\{[^}]*\}))?/g;
    for (const m of line.matchAll(CR)) {
      if (m[1].includes(".")) continue;
      const fb = m[2] && m[2].startsWith('"') ? m[2].slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, "\\n") : undefined;
      note(lineNs[i], m[1], line, fb);
    }
    const SR = /[^a-zA-Z](?:t|getTranslation)\(\s*[a-zA-Z_]+,\s*"([a-zA-Z0-9_]+)"\s*,/g;
    for (const m of line.matchAll(SR)) {
      if (m[1].includes(".")) continue;
      note(lineNs[i], m[1], line, undefined);
    }
  }
}

const missing = [...used.entries()].filter(([id]) => !seedKeys.has(id)).sort();
let out = "";
for (const [id, rec] of missing) {
  out += `\n## ${id}\n`;
  if (rec.fbSet) out += `FB: ${rec.fb}\n`;
  else out += `NO-FALLBACK (nfb:${rec.nfb})\n`;
  for (const s of rec.samples) out += `  | ${s}\n`;
}
console.log(out);
