# general-purpose

A collection of small, independent projects. Run `make` to list every command.

## VS Code extension (JB Look)

A JetBrains Islands Dark–style theme and file icons for VS Code.

**Install:**

```sh
make vscode
```

Then add these lines to your user `settings.json` (Cmd+Shift+P → **Preferences: Open User Settings (JSON)**):

```jsonc
"workbench.colorTheme": "JB Dark",
"workbench.iconTheme": "jb-icons"
```

**Requires:** Node.js (`brew install node`) and the VS Code `code` command (Cmd+Shift+P → **Shell Command: Install 'code' command in PATH**).
