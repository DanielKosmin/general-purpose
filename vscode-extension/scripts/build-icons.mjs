#!/usr/bin/env node
// Generates icons/dark/*.svg and icons/jb-icon-theme.json.
// Add/modify icons in the ICONS table below, then run `make icons`.
// Never hand-edit files under icons/ — they are overwritten.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'icons');

// JetBrains New UI-inspired icon palette. Tuned for dark backgrounds.
const PALETTE = {
  dark: {
    gray: '#CED0D6', blue: '#548AF7', green: '#5FB865', yellow: '#F2C55C', orange: '#E08855',
    red: '#F75464', purple: '#A571E6', teal: '#3BABB6', pink: '#E66EA4',
  },
};
const TINT = { dark: 0.2 };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">${body}</svg>\n`;

// ---- Shape primitives. Each returns (colors, mode) => svg body. ----

/** Rounded square badge with a short label, like the New UI "TS"/"JS" icons. */
const badge = (label, color) => (c, mode) => {
  const col = c[color];
  const size = label.length >= 3 ? 5.8 : label.length === 2 ? 7.2 : 9;
  const spacing = label.length >= 3 ? ' letter-spacing="-0.3"' : '';
  const y = (8 + size * 0.36).toFixed(2);
  return (
    `<rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<text x="8" y="${y}" text-anchor="middle" font-family="JetBrains Mono, SF Mono, Menlo, Consolas, monospace" ` +
    `font-weight="700" font-size="${size}"${spacing} fill="${col}">${esc(label)}</text>`
  );
};

/** Plain document with folded corner, optionally with a small label/lines inside. */
const page = (color = 'gray', inner = '') => (c, mode) => {
  const col = c[color];
  return (
    `<path d="M3.5 1.5h6l3 3v10h-9z" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}" stroke-linejoin="round"/>` +
    `<path d="M9.5 1.5v3h3" stroke="${col}" stroke-linejoin="round"/>` +
    (typeof inner === 'function' ? inner(col) : inner)
  );
};
const textLines = (col) => `<path d="M5.5 7.5h5M5.5 9.5h5M5.5 11.5h3" stroke="${col}" stroke-linecap="round"/>`;

const image = (color) => (c, mode) => {
  const col = c[color];
  return (
    `<rect x="1.5" y="2.5" width="13" height="11" rx="2" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<circle cx="5.5" cy="6" r="1.25" fill="${col}"/>` +
    `<path d="M2 12.5l4-4 3 3 2-2 3.5 3.5" stroke="${col}" stroke-linejoin="round"/>`
  );
};

const lock = (color) => (c, mode) => {
  const col = c[color];
  return (
    `<rect x="2.5" y="6.5" width="11" height="8" rx="1.5" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<path d="M5 6.5V4.5a3 3 0 0 1 6 0v2" stroke="${col}"/>` +
    `<circle cx="8" cy="10.5" r="1.2" fill="${col}"/>`
  );
};

const archive = (color) => (c, mode) => {
  const col = c[color];
  return (
    `<rect x="2.5" y="1.5" width="11" height="13" rx="1.5" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<path d="M8 2v1.5M8 4.5v1.5M8 7v1.5" stroke="${col}" stroke-width="1.5"/>` +
    `<rect x="6.5" y="9.5" width="3" height="3" rx=".5" stroke="${col}"/>`
  );
};

const git = (color) => (c) => {
  const col = c[color];
  return (
    `<circle cx="4.5" cy="3.5" r="1.75" stroke="${col}"/>` +
    `<circle cx="4.5" cy="12.5" r="1.75" stroke="${col}"/>` +
    `<circle cx="11.5" cy="5.5" r="1.75" stroke="${col}"/>` +
    `<path d="M4.5 5.25v5.5M11.5 7.25c0 2.5-7 1.5-7 3.5" stroke="${col}"/>`
  );
};

const gear = (color) => (c, mode) => {
  const col = c[color];
  return (
    `<circle cx="8" cy="8" r="5" stroke="${col}" stroke-width="3" stroke-dasharray="2.2 1.73"/>` +
    `<circle cx="8" cy="8" r="3.5" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<circle cx="8" cy="8" r="1.25" fill="${col}"/>`
  );
};

const terminal = (color) => (c, mode) => {
  const col = c[color];
  return (
    `<rect x="1.5" y="2.5" width="13" height="11" rx="2" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<path d="M4.5 6l2 2-2 2M8 10.5h3.5" stroke="${col}" stroke-linecap="round" stroke-linejoin="round"/>`
  );
};

const info = (color) => (c, mode) => {
  const col = c[color];
  return (
    `<circle cx="8" cy="8" r="6.5" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<circle cx="8" cy="5" r="1" fill="${col}"/>` +
    `<path d="M8 7.5v4" stroke="${col}" stroke-width="1.5" stroke-linecap="round"/>`
  );
};

const database = (color) => (c, mode) => {
  const col = c[color];
  return (
    `<path d="M2.5 3.5v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<ellipse cx="8" cy="3.5" rx="5.5" ry="2" fill="${col}" fill-opacity="${TINT[mode]}" stroke="${col}"/>` +
    `<path d="M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2" stroke="${col}"/>`
  );
};

// Folder colors match IntelliJ's New UI folder node (opaque fill + light outline), not a tint.
const FOLDER_STYLES = {
  plain: { stroke: '#CED0D6', fill: '#43454A' },   // expui folder: every folder looks the same
  dimmed: { stroke: '#6F737A', fill: '#2B2D30' },  // excluded / generated / dependency folders: greyed out
};
const folder = (style, open) => () => {
  const { stroke, fill } = FOLDER_STYLES[style];
  const body = `fill="${fill}" stroke="${stroke}" stroke-linejoin="round"`;
  if (!open) {
    return `<path d="M1.5 3.5a1 1 0 0 1 1-1h3.59l1.7 1.7h5.71a1 1 0 0 1 1 1v6.8a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z" ${body}/>`;
  }
  return (
    `<path d="M1.5 12.5v-9a1 1 0 0 1 1-1h3.59l1.7 1.7h5.21a1 1 0 0 1 1 1v1.3" stroke="${stroke}" stroke-linejoin="round"/>` +
    `<path d="M1.5 12.5l2.3-5.2a1 1 0 0 1 .92-.6h9.78a.5.5 0 0 1 .46.7l-2.2 5.1z" ${body}/>`
  );
};

// ---- Icon table. ----
// ext: file extensions (no dot), names: exact file names (lowercase), langs: VS Code language ids.
const ICONS = [
  { id: 'file', draw: page('gray') },
  { id: 'text', draw: page('gray', textLines), ext: ['txt', 'text', 'log', 'out'], langs: ['plaintext', 'log'] },

  // Languages
  { id: 'typescript', draw: badge('TS', 'blue'), ext: ['ts', 'mts', 'cts'], langs: ['typescript'] },
  { id: 'typescript-def', draw: badge('DTS', 'blue'), ext: ['d.ts', 'd.mts', 'd.cts'] },
  { id: 'tsx', draw: badge('TSX', 'blue'), ext: ['tsx'], langs: ['typescriptreact'] },
  { id: 'javascript', draw: badge('JS', 'yellow'), ext: ['js', 'mjs', 'cjs'], langs: ['javascript'] },
  { id: 'jsx', draw: badge('JSX', 'yellow'), ext: ['jsx'], langs: ['javascriptreact'] },
  { id: 'json', draw: badge('{}', 'orange'), ext: ['json', 'jsonc', 'json5', 'jsonl', 'webmanifest'], langs: ['json', 'jsonc', 'jsonl'] },
  { id: 'python', draw: badge('Py', 'blue'), ext: ['py', 'pyi', 'pyw'], langs: ['python'] },
  { id: 'notebook', draw: badge('NB', 'orange'), ext: ['ipynb'] },
  { id: 'java', draw: badge('J', 'orange'), ext: ['java'], langs: ['java'] },
  { id: 'class', draw: badge('C', 'gray'), ext: ['class', 'jar'] },
  { id: 'kotlin', draw: badge('K', 'purple'), ext: ['kt', 'kts'], langs: ['kotlin'] },
  { id: 'scala', draw: badge('S', 'red'), ext: ['scala', 'sc', 'sbt'], langs: ['scala'] },
  { id: 'groovy', draw: badge('G', 'teal'), ext: ['groovy', 'gradle'], langs: ['groovy'] },
  { id: 'go', draw: badge('GO', 'teal'), ext: ['go'], langs: ['go'] },
  { id: 'gomod', draw: badge('MOD', 'teal'), names: ['go.mod', 'go.sum', 'go.work'] },
  { id: 'rust', draw: badge('RS', 'orange'), ext: ['rs'], langs: ['rust'] },
  { id: 'c', draw: badge('C', 'blue'), ext: ['c'], langs: ['c'] },
  { id: 'cpp', draw: badge('C++', 'blue'), ext: ['cpp', 'cc', 'cxx', 'c++', 'ino'], langs: ['cpp'] },
  { id: 'header', draw: badge('H', 'purple'), ext: ['h', 'hpp', 'hh', 'hxx', 'h++'] },
  { id: 'csharp', draw: badge('C#', 'green'), ext: ['cs', 'csx'], langs: ['csharp'] },
  { id: 'fsharp', draw: badge('F#', 'blue'), ext: ['fs', 'fsi', 'fsx'], langs: ['fsharp'] },
  { id: 'swift', draw: badge('SW', 'orange'), ext: ['swift'], langs: ['swift'] },
  { id: 'objc', draw: badge('M', 'blue'), ext: ['m', 'mm'], langs: ['objective-c', 'objective-cpp'] },
  { id: 'dart', draw: badge('D', 'teal'), ext: ['dart'], langs: ['dart'] },
  { id: 'ruby', draw: badge('RB', 'red'), ext: ['rb', 'erb', 'gemspec', 'rake'], names: ['gemfile', 'rakefile'], langs: ['ruby'] },
  { id: 'php', draw: badge('PHP', 'purple'), ext: ['php', 'phtml'], langs: ['php'] },
  { id: 'lua', draw: badge('LUA', 'blue'), ext: ['lua'], langs: ['lua'] },
  { id: 'r', draw: badge('R', 'blue'), ext: ['r', 'rmd'], langs: ['r'] },
  { id: 'elixir', draw: badge('EX', 'purple'), ext: ['ex', 'exs', 'heex'], langs: ['elixir'] },
  { id: 'haskell', draw: badge('λ', 'purple'), ext: ['hs', 'lhs'], langs: ['haskell'] },
  { id: 'clojure', draw: badge('CLJ', 'green'), ext: ['clj', 'cljs', 'cljc', 'edn'], langs: ['clojure'] },
  { id: 'zig', draw: badge('ZIG', 'orange'), ext: ['zig'] },
  { id: 'sql', draw: database('teal'), ext: ['sql', 'psql', 'mysql', 'sqlite', 'db'], langs: ['sql'] },
  { id: 'graphql', draw: badge('GQL', 'pink'), ext: ['graphql', 'gql'], langs: ['graphql'] },
  { id: 'proto', draw: badge('PB', 'gray'), ext: ['proto'], langs: ['proto3', 'proto'] },
  { id: 'terraform', draw: badge('TF', 'purple'), ext: ['tf', 'tfvars', 'hcl'], langs: ['terraform', 'hcl'] },
  { id: 'shell', draw: terminal('gray'), ext: ['sh', 'bash', 'zsh', 'fish', 'ksh', 'command'], names: ['.zshrc', '.bashrc', '.bash_profile', '.zprofile', '.profile'], langs: ['shellscript'] },
  { id: 'powershell', draw: terminal('blue'), ext: ['ps1', 'psm1', 'psd1', 'bat', 'cmd'], langs: ['powershell', 'bat'] },

  // Web
  { id: 'html', draw: badge('<>', 'orange'), ext: ['html', 'htm', 'xhtml'], langs: ['html'] },
  { id: 'css', draw: badge('#', 'blue'), ext: ['css'], langs: ['css'] },
  { id: 'scss', draw: badge('S', 'pink'), ext: ['scss', 'sass'], langs: ['scss', 'sass'] },
  { id: 'less', draw: badge('LS', 'blue'), ext: ['less'], langs: ['less'] },
  { id: 'vue', draw: badge('V', 'green'), ext: ['vue'], langs: ['vue'] },
  { id: 'svelte', draw: badge('S', 'orange'), ext: ['svelte'], langs: ['svelte'] },
  { id: 'astro', draw: badge('A', 'purple'), ext: ['astro'], langs: ['astro'] },
  { id: 'xml', draw: badge('</>', 'orange'), ext: ['xml', 'xsd', 'xsl', 'xslt', 'plist', 'csproj', 'fsproj', 'iml', 'pom'], langs: ['xml'] },
  { id: 'template', draw: badge('{{}}', 'green'), ext: ['hbs', 'handlebars', 'mustache', 'njk', 'jinja', 'j2', 'tmpl', 'liquid'] },

  // Data / config / docs
  { id: 'yaml', draw: badge('YML', 'red'), ext: ['yaml', 'yml'], langs: ['yaml'] },
  { id: 'toml', draw: badge('T', 'gray'), ext: ['toml'], langs: ['toml'] },
  { id: 'ini', draw: gear('gray'), ext: ['ini', 'cfg', 'conf', 'properties', 'editorconfig'], names: ['.editorconfig', '.nvmrc', '.yarnrc', '.prettierrc', '.eslintrc', '.babelrc', '.browserslistrc'], langs: ['ini', 'properties'] },
  { id: 'env', draw: badge('ENV', 'yellow'), ext: ['env'], names: ['.env', '.env.local', '.env.development', '.env.production', '.env.test', '.env.example', '.envrc'], langs: ['dotenv'] },
  { id: 'csv', draw: badge('CSV', 'green'), ext: ['csv', 'tsv', 'xlsx', 'xls'], langs: ['csv', 'tsv'] },
  { id: 'markdown', draw: badge('MD', 'blue'), ext: ['md', 'markdown', 'mdx', 'mdc'], langs: ['markdown', 'mdx'] },
  { id: 'rst', draw: page('blue', textLines), ext: ['rst', 'adoc', 'asciidoc', 'tex', 'org'] },
  { id: 'pdf', draw: badge('PDF', 'red'), ext: ['pdf'] },
  { id: 'image', draw: image('teal'), ext: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'icns', 'tif', 'tiff', 'avif', 'heic'] },
  { id: 'svg', draw: image('orange'), ext: ['svg'] },
  { id: 'font', draw: badge('Aa', 'gray'), ext: ['ttf', 'otf', 'woff', 'woff2', 'eot'] },
  { id: 'media', draw: badge('▶', 'purple'), ext: ['mp4', 'mov', 'webm', 'mkv', 'avi', 'mp3', 'wav', 'flac', 'ogg', 'm4a'] },
  { id: 'archive', draw: archive('gray'), ext: ['zip', 'tar', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'vsix', 'whl'] },
  { id: 'binary', draw: badge('01', 'gray'), ext: ['exe', 'dll', 'so', 'dylib', 'bin', 'o', 'a', 'wasm', 'pyc'] },
  { id: 'lock', draw: lock('gray'), ext: ['lock'], names: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock', 'cargo.lock', 'poetry.lock', 'uv.lock', 'gemfile.lock', 'composer.lock', 'pipfile.lock', 'flake.lock'] },
  { id: 'key', draw: lock('yellow'), ext: ['pem', 'key', 'crt', 'cer', 'p12', 'pfx', 'pub', 'gpg', 'asc'] },
  { id: 'diff', draw: badge('±', 'green'), ext: ['diff', 'patch'], langs: ['diff'] },

  // Well-known files
  { id: 'git', draw: git('orange'), names: ['.gitignore', '.gitattributes', '.gitmodules', '.gitkeep', '.git-blame-ignore-revs', '.mailmap'], langs: ['ignore', 'git-commit', 'git-rebase'] },
  { id: 'ignore', draw: page('gray', (col) => `<path d="M5.5 11.5l5-5" stroke="${col}" stroke-linecap="round"/>`), names: ['.dockerignore', '.npmignore', '.prettierignore', '.eslintignore', '.vscodeignore', '.ignore'] },
  { id: 'npm', draw: badge('npm', 'red'), names: ['package.json', '.npmrc'] },
  { id: 'tsconfig', draw: badge('TS', 'gray'), names: ['tsconfig.json', 'jsconfig.json', 'tsconfig.base.json', 'tsconfig.build.json'] },
  { id: 'docker', draw: badge('DKR', 'blue'), ext: ['dockerfile', 'containerfile'], names: ['dockerfile', 'containerfile', 'docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'], langs: ['dockerfile', 'dockercompose'] },
  { id: 'make', draw: badge('M', 'gray'), ext: ['mk', 'mak'], names: ['makefile', 'gnumakefile', 'justfile', 'cmakelists.txt', 'meson.build'], langs: ['makefile', 'cmake'] },
  { id: 'readme', draw: info('blue'), names: ['readme.md', 'readme', 'readme.txt', 'readme.rst'] },
  { id: 'license', draw: page('yellow', (col) => `<path d="M5.5 9.5h5M5.5 11.5h3" stroke="${col}" stroke-linecap="round"/><circle cx="8" cy="6.5" r="1.25" fill="${col}"/>`), names: ['license', 'license.md', 'license.txt', 'licence', 'copying', 'notice'] },
  { id: 'changelog', draw: page('green', textLines), names: ['changelog.md', 'changelog', 'changes.md', 'history.md'] },
  { id: 'ai', draw: badge('AI', 'purple'), names: ['claude.md', 'agents.md', '.cursorrules', 'copilot-instructions.md', 'gemini.md'] },
  { id: 'config-js', draw: gear('yellow'), names: ['vite.config.ts', 'vite.config.js', 'vite.config.mjs', 'webpack.config.js', 'rollup.config.js', 'rollup.config.mjs', 'next.config.js', 'next.config.mjs', 'next.config.ts', 'tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js', 'postcss.config.mjs', 'eslint.config.js', 'eslint.config.mjs', 'prettier.config.js', 'babel.config.js', 'jest.config.js', 'jest.config.ts', 'vitest.config.ts', 'vitest.config.js', 'svelte.config.js', 'astro.config.mjs', 'nuxt.config.ts'] },
  { id: 'python-config', draw: gear('blue'), names: ['pyproject.toml', 'setup.py', 'setup.cfg', 'requirements.txt', 'requirements-dev.txt', 'pipfile', 'tox.ini', '.python-version'] },
  { id: 'cargo', draw: gear('orange'), names: ['cargo.toml'] },
  { id: 'gradle-build', draw: gear('teal'), names: ['build.gradle', 'build.gradle.kts', 'settings.gradle', 'settings.gradle.kts', 'gradle.properties', 'gradlew', 'gradlew.bat', 'pom.xml'] },
];

// ---- Folders ----
// Like IntelliJ, every folder is the same plain icon; there is no per-name coloring (IntelliJ only
// colors folders explicitly marked as source/test roots, which VS Code can't know). The one exception
// is dependency / build-output folders, which are greyed out the way excluded folders recede in IntelliJ.
const FOLDERS = [
  { id: 'folder', style: 'plain' },
  { id: 'folder-dimmed', style: 'dimmed', names: ['node_modules', 'dist', 'build', 'out', 'target', '.next', '.nuxt', '.output', '.svelte-kit', '.cache', '.parcel-cache', 'coverage', '.nyc_output', '__pycache__', '.venv', 'venv', '.tox', '.gradle', '.pytest_cache', '.mypy_cache', '.ruff_cache', '.turbo', 'bower_components', '.git'] },
];

// ---- Emit ----
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'dark'), { recursive: true });

const defs = {};
const write = (id, draw) => {
  writeFileSync(join(OUT, 'dark', `${id}.svg`), svg(draw(PALETTE.dark, 'dark')));
  defs[id] = { iconPath: `./dark/${id}.svg` };
};

const maps = { fileExtensions: {}, fileNames: {}, languageIds: {}, folderNames: {}, folderNamesExpanded: {} };
const seen = { fileExtensions: new Map(), fileNames: new Map(), languageIds: new Map() };
const assign = (kind, key, id) => {
  key = key.toLowerCase();
  if (seen[kind].has(key)) throw new Error(`Duplicate ${kind} key "${key}" in "${id}" and "${seen[kind].get(key)}"`);
  seen[kind].set(key, id);
  maps[kind][key] = id;
};

for (const icon of ICONS) {
  write(icon.id, icon.draw);
  for (const e of icon.ext ?? []) assign('fileExtensions', e, icon.id);
  for (const n of icon.names ?? []) assign('fileNames', n, icon.id);
  for (const l of icon.langs ?? []) assign('languageIds', l, icon.id);
}
for (const f of FOLDERS) {
  write(f.id, folder(f.style, false));
  write(`${f.id}-open`, folder(f.style, true));
  for (const n of f.names ?? []) {
    maps.folderNames[n] = f.id;
    maps.folderNamesExpanded[n] = `${f.id}-open`;
  }
}

const base = {
  file: 'file',
  folder: 'folder',
  folderExpanded: 'folder-open',
  rootFolder: 'folder',
  rootFolderExpanded: 'folder-open',
};
const theme = {
  hidesExplorerArrows: false,
  iconDefinitions: defs,
  ...base,
  ...maps,
};
writeFileSync(join(OUT, 'jb-icon-theme.json'), JSON.stringify(theme, null, 2) + '\n');
console.log(`  wrote ${Object.keys(defs).length} svgs + icons/jb-icon-theme.json`);
