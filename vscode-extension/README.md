# JB Look

Make VS Code look like a JetBrains IDE (New UI, dark). It includes a dark color theme, matching file icons, and a command that applies IntelliJ-like editor settings.

## Install

```sh
make vscode
```

Then add these two lines to your user `settings.json`:

```jsonc
"workbench.colorTheme": "JB Dark",
"workbench.iconTheme": "jb-icons"
```

**Optional:** to get the rest of the IntelliJ feel (font, no minimap, full-line highlight, and so on), run **JB Look: Apply Recommended IntelliJ-style Settings** from the Command Palette. **JB Look: Restore Settings From Before JB Look** undoes it. The font is JetBrains Mono, which you can install with `brew install --cask font-jetbrains-mono`.

## Develop

From the repo root, run `make vscode` to build and install. Colors live in `scripts/build-themes.mjs` and icons live in `scripts/build-icons.mjs`. Edit those files, then run `make vscode` again. For more, see `AGENTS.md` at the repo root.
