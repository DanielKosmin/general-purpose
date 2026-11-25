#!/usr/bin/env node
// Writes dist/icon-preview.html: every generated icon at 16px and 32px on the dark panel.
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ids = readdirSync(join(ROOT, 'icons/dark')).filter((f) => f.endsWith('.svg')).sort();
const column = (mode, bg, fg) =>
  `<section style="background:${bg};color:${fg};padding:16px;flex:1"><h3 style="font-family:sans-serif">${mode}</h3>` +
  ids
    .map(
      (f) =>
        `<div style="display:flex;gap:10px;align-items:center;font:12px monospace;margin:6px 0">` +
        `<img src="../icons/${mode}/${f}" width="16" height="16"><img src="../icons/${mode}/${f}" width="32" height="32">${f.slice(0, -4)}</div>`,
    )
    .join('') +
  `</section>`;

mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(
  join(ROOT, 'dist/icon-preview.html'),
  `<!doctype html><title>JB Icons preview</title><body style="margin:0;display:flex">${column('dark', '#2B2D30', '#DFE1E5')}</body>\n`,
);
console.log(`  wrote dist/icon-preview.html (${ids.length} icons)`);
