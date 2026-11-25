#!/usr/bin/env node
// Sanity checks: every JSON parses, every path in package.json contributes exists,
// and every iconDefinition in the icon theme points at a real file.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    errors.push(`${p}: ${e.message}`);
    return null;
  }
};

const pkg = readJson(join(ROOT, 'package.json'));
const c = pkg?.contributes ?? {};
const refs = [...(c.themes ?? []), ...(c.iconThemes ?? []), ...(c.productIconThemes ?? [])];
if (pkg?.main && !existsSync(join(ROOT, pkg.main))) errors.push(`package.json main missing: ${pkg.main}`);

for (const ref of refs) {
  const file = join(ROOT, ref.path);
  if (!existsSync(file)) {
    errors.push(`missing ${ref.path} (run \`make build\`)`);
    continue;
  }
  const json = readJson(file);
  if (!json) continue;

  if (json.iconDefinitions) {
    const base = dirname(file);
    for (const [id, def] of Object.entries(json.iconDefinitions)) {
      if (def.iconPath && !existsSync(resolve(base, def.iconPath))) errors.push(`${ref.path}: ${id} -> ${def.iconPath} not found`);
    }
    const ids = new Set(Object.keys(json.iconDefinitions));
    const check = (obj, where) => {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && !['light', 'highContrast'].includes(k) && !ids.has(v) && k !== 'hidesExplorerArrows')
          errors.push(`${ref.path}: ${where}${k} -> unknown icon "${v}"`);
        else if (v && typeof v === 'object' && k !== 'iconDefinitions') check(v, `${where}${k}.`);
      }
    };
    check(json, '');
  }
  if (json.colors) {
    for (const [k, v] of Object.entries(json.colors)) {
      if (!/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) errors.push(`${ref.path}: bad color ${k}=${v}`);
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ ${refs.length} theme file(s) valid`);
