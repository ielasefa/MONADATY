/* Build runtime defaults from the existing translation seed, without running it. */
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const source = ts.createSourceFile("seed-translations.ts", fs.readFileSync(path.join(root, "prisma/seed-translations.ts"), "utf8"), ts.ScriptTarget.Latest, true);
const namespaces = {};
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === "translations" && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
    for (const element of node.initializer.elements) {
      if (!ts.isObjectLiteralExpression(element)) continue;
      const entry = {};
      for (const property of element.properties) {
        if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)) entry[property.name.getText(source).replaceAll('"', "")] = property.initializer.text;
      }
      if (!entry.namespace || !entry.key || !entry.fr || !entry.en || !entry.ar) continue;
      (namespaces[entry.namespace] ||= {})[entry.key] = { fr: entry.fr, en: entry.en, ar: entry.ar };
    }
  }
  ts.forEachChild(node, visit);
}
visit(source);
const defaults = Object.fromEntries(["admin", "inventory", "auth", "system", "invoice"].map(namespace => [namespace, { ...namespaces.common, ...namespaces[namespace] }]));
fs.writeFileSync(path.join(root, "lib/admin-copy.generated.json"), JSON.stringify(defaults, null, 2) + "\n");
console.log("Generated administration translation defaults from the existing seed.");
