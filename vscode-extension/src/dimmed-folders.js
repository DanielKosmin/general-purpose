// Folder names that are greyed out (icon + label), like excluded folders in IntelliJ.
// Single source of truth: used by scripts/build-icons.mjs (icon) and src/extension.js (label color).
module.exports = [
  'node_modules', 'bower_components',
  'dist', 'build', 'out', 'target',
  '.next', '.nuxt', '.output', '.svelte-kit', '.turbo',
  '.cache', '.parcel-cache',
  'coverage', '.nyc_output',
  '__pycache__', '.venv', 'venv', '.tox', '.pytest_cache', '.mypy_cache', '.ruff_cache',
  '.gradle',
  '.git',
];
