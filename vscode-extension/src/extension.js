// @ts-check
const vscode = require('vscode');
const DIMMED_FOLDERS = new Set(require('./dimmed-folders'));

const BACKUP_KEY = 'jbLook.settingsBackup';
const DARK = 'JB Dark';
const ICONS = 'jb-icons';

/**
 * Settings that make VS Code behave/look closer to IntelliJ. Keys are full setting ids.
 */
const RECOMMENDED = {
  'workbench.colorTheme': DARK,
  'workbench.iconTheme': ICONS,
  'editor.fontFamily': "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
  'editor.fontSize': 13,
  'editor.lineHeight': 1.7,
  'editor.fontLigatures': false,
  'editor.renderLineHighlight': 'all',
  'editor.minimap.enabled': false,
  'editor.stickyScroll.enabled': true,
  'editor.guides.indentation': true,
  'editor.guides.bracketPairs': false,
  'editor.bracketPairColorization.enabled': false,
  'editor.occurrencesHighlight': 'singleFile',
  'editor.cursorBlinking': 'blink',
  'editor.scrollbar.verticalScrollbarSize': 10,
  'editor.scrollbar.horizontalScrollbarSize': 10,
  'editor.inlayHints.fontSize': 12,
  'workbench.tree.indent': 14,
  'workbench.tree.renderIndentGuides': 'none',
  'workbench.editor.tabSizing': 'shrink',
  'workbench.editor.highlightModifiedTabs': true,
  'window.commandCenter': true,
  'terminal.integrated.fontFamily': "'JetBrains Mono', Menlo, monospace",
  'terminal.integrated.fontSize': 13,
};

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('jbLook.applyRecommendedSettings', () => applySettings(context)),
    vscode.commands.registerCommand('jbLook.restoreSettings', () => restoreSettings(context)),
    // Grey out dependency/build folders by name. Git's "ignored" color is computed lazily (only once a
    // folder has been expanded), so relying on it alone leaves node_modules etc. un-greyed until clicked.
    vscode.window.registerFileDecorationProvider({
      provideFileDecoration(uri) {
        const name = uri.path.slice(uri.path.lastIndexOf('/') + 1).toLowerCase();
        if (!DIMMED_FOLDERS.has(name)) return undefined;
        return new vscode.FileDecoration(undefined, undefined, new vscode.ThemeColor('jbLook.dimmedForeground'));
      },
    }),
  );
}

/** @param {vscode.ExtensionContext} context */
async function applySettings(context) {
  const cfg = vscode.workspace.getConfiguration();
  const updates = { ...RECOMMENDED };

  // Back up the user's current global values once, so "Restore" returns to pre-JB state.
  if (!context.globalState.get(BACKUP_KEY)) {
    /** @type {Record<string, unknown>} */
    const backup = {};
    for (const key of Object.keys(updates)) {
      backup[key] = cfg.inspect(key)?.globalValue ?? null;
    }
    await context.globalState.update(BACKUP_KEY, backup);
  }

  for (const [key, value] of Object.entries(updates)) {
    await cfg.update(key, value, vscode.ConfigurationTarget.Global);
  }

  const fonts = await vscode.window.showInformationMessage(
    'JB Look applied. For the full effect, install the JetBrains Mono font (free, OFL).',
    'Get JetBrains Mono',
  );
  if (fonts) vscode.env.openExternal(vscode.Uri.parse('https://www.jetbrains.com/lp/mono/'));
}

/** @param {vscode.ExtensionContext} context */
async function restoreSettings(context) {
  /** @type {Record<string, unknown> | undefined} */
  const backup = context.globalState.get(BACKUP_KEY);
  if (!backup) {
    vscode.window.showInformationMessage('JB Look: nothing to restore — recommended settings were never applied.');
    return;
  }
  const cfg = vscode.workspace.getConfiguration();
  for (const [key, value] of Object.entries(backup)) {
    await cfg.update(key, value ?? undefined, vscode.ConfigurationTarget.Global);
  }
  await context.globalState.update(BACKUP_KEY, undefined);
  vscode.window.showInformationMessage('JB Look: previous settings restored.');
}

function deactivate() {}

module.exports = { activate, deactivate };
