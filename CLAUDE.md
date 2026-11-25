# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- Read `AGENTS.md` (imported above) first. It's the canonical project guide. Put shared guidance there, not here.
- After you edit a generator script, run `make package` in the same turn. It regenerates the files and validates them without installing.
- To check icons visually, run `node vscode-extension/scripts/preview-icons.mjs` and screenshot `vscode-extension/dist/icon-preview.html` with headless Chrome. Then view the PNG.
- Don't run `make vscode` unless the user asks. It installs into the user's real VS Code.
