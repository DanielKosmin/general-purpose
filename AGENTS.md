# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, etc.) working in this repo.

## Repo layout

All repo-wide files live at the root: this file, `CLAUDE.md`, `README.md`, `LICENSE`, `.gitignore`, `.gitattributes`, `.editorconfig` and the `Makefile`. Line endings are always LF, never CRLF (enforced by `.gitattributes`). Each project gets its own subdirectory, which holds only that project's own files.

```
Makefile                                   All workflows; run `make help`
vscode-extension/
  package.json, README.md, .vscodeignore   Extension manifest and Marketplace readme
  src/extension.js                         Settings commands + greys out dependency/build folder names
  src/show-usages.js                       IntelliJ-style Show Usages popup
  src/dimmed-folders.js                    The greyed-out folder names (shared by icons and extension)
  scripts/build-themes.mjs                 SOURCE OF TRUTH for colors → themes/*.json
  scripts/build-icons.mjs                  SOURCE OF TRUTH for icons (ICONS/FOLDERS tables) → icons/**
  scripts/validate.mjs                     Checks JSON, color formats, icon paths/references
  scripts/preview-icons.mjs                Writes dist/icon-preview.html
  themes/, icons/                          GENERATED: do not hand-edit; committed so it packages as-is
```

## vscode-extension: JB Look

A VS Code extension that makes VS Code look like a JetBrains IDE with the New UI. It ships:

- **Color theme**: `JB Dark` only (no light theme, on purpose). It matches JetBrains **Islands Dark**, the default theme since IntelliJ 2025.3. Dark "islands" (editor, side bar, panel: `#191A1C`) sit on a lighter frame (title, activity bar, status bar: `#26282C`). The colors come from `ManyIslandsDark.theme.json` and `IslandSchemeDark.xml` in `JetBrains/intellij-community` under `platform/platform-resources/src/themes/islands/`. When you tune colors, check them against those files, not against the older "Dark" New UI theme.
- **File icon theme**: `jb-icons`. Original 16×16 SVGs in the New UI style: tinted rounded badges for languages. Folders follow IntelliJ: every folder uses the same plain icon (fill `#43454A`, outline `#CED0D6`), with no coloring by name. The only exception is dependency and build-output folders (`node_modules`, `dist`, `.venv`, …), which are greyed out, and git-ignored names are grey too (`gitIgnored`).
- **Syntax colors are per language**, matching IntelliJ's per-language keys (JS.*, PY.*, Java, Kotlin), mainly through `semanticTokenColors` language selectors (`variable:javascript`). For example, JS/TS global variables are purple italic and JS calls are blue, while Java calls are plain and only declarations are blue. Python attributes aren't colored. To check a value, resolve the key through Islands Dark → Darcula (`DefaultColorSchemesManager.xml`) → the language scheme file (e.g. `python/python-syntax/resources/colorSchemes/PythonDarcula.xml`) → the fallback key in code (`createTextAttributesKey("X", FALLBACK)`). JavaScript's keys are closed-source, so only the Islands overrides are known for it.
- **Keybindings** (IntelliJ macOS keymap): Back = Cmd+Option+← / Cmd+[, Forward = Cmd+Option+→ / Cmd+]. Show Usages = Cmd+Option+F7. Go to Declaration or Usages = Cmd+B.
- **Show Usages popup** (`src/show-usages.js`): an IntelliJ-style floating list of usages, grouped by file, with live preview; Esc returns to where you started. Cmd+B on a declaration opens it, and on a usage it jumps to the declaration. **Cmd+click can't open it**: `editor.gotoLocation.alternativeDefinitionCommand` only accepts VS Code's built-in navigation actions and silently ignores extension commands, which breaks Cmd+click (checked in `goToCommands.ts`). Don't set it.
- **Commands**: `JB Look: Apply Recommended IntelliJ-style Settings` and `JB Look: Restore Settings From Before JB Look`.

There's no runtime dependency and no bundler. The extension is plain CommonJS.

## Commands

Keep the Makefile small. Plain `make` lists the commands. Every target gets its own `.PHONY` line and a `## description`, and sits under a `##@ Section`. The README only says how to install each part.

- `make vscode`: build and install the extension (the user runs this).
- `make package`: build and validate without installing (agents use this).
- `make uninstall`, `make clean`

For an icon sheet, run `node vscode-extension/scripts/preview-icons.mjs`.

## Conventions

- **Never edit `themes/*.json` or `icons/**` by hand.** Edit the generator scripts and rebuild. Commit the generator change and the regenerated output together.
- **Colors**: put a color in the palette object (`ui`, `ansi` or `syn`) in `build-themes.mjs`. Don't inline hex values into `workbench()` or `tokenColors()`.
- **Icons**: to add a file type, add an entry to `ICONS` in `build-icons.mjs` with `ext` / `names` / `langs`. Keys are matched lowercase, and duplicates throw at build time. Reuse the existing shape helpers (`badge`, `page`, `image`, `gear`, …) and the named palette colors so the set stays consistent.
- **Icon design rules**: 16×16 viewBox, 1px strokes on half-pixel coordinates (crisp at 1×), tinted fill, and badge labels of no more than 3 characters.
- **Don't copy JetBrains' actual icon SVGs or logos.** The icons are original drawings in a similar style.
- The extension activates `onStartupFinished`. It has to start with VS Code because it greys out dependency and build folder names (`node_modules`, `dist`, …) itself: git's ignored color is only computed once a folder is expanded, so it can't be relied on. Keep startup work trivial.
- The list of greyed-out folders lives only in `vscode-extension/src/dimmed-folders.js`. Both the folder icon (`build-icons.mjs`) and the label color (`extension.js`) read it.
- Bump `version` in `vscode-extension/package.json` for every change you intend to install, so VS Code picks it up.

## Verifying visual changes

There are no unit tests. Verify like this:
1. `make package`. This regenerates the files and runs the validator.
2. Run `node vscode-extension/scripts/preview-icons.mjs` for icons, or `make vscode` (with the user's OK) and open some real files for the theme.
