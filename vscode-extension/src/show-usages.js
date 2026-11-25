// @ts-check
// IntelliJ-style "Show Usages" popup (⌘⌥F7) and "Go to Declaration or Usages" (⌘B).
// Note: VS Code's ⌘-click can't be routed here: editor.gotoLocation.alternativeDefinitionCommand only
// accepts VS Code's own built-in navigation actions and silently ignores extension commands.
// A floating list of every usage, grouped by file. Arrowing through it previews each location;
// Enter jumps there, Esc returns to where you started.
const vscode = require('vscode');

const MAX_LABEL = 140;

/** @type {vscode.LogOutputChannel | undefined} */
let log;
/** Logs go to Output → "JB Look" and to VS Code's log folder (exthost/local.jb-look/). */
function logger() {
  return (log ??= vscode.window.createOutputChannel('JB Look', { log: true }));
}

/** ⌘B: on a usage → jump to its declaration; on the declaration itself → usages popup (IntelliJ). */
async function gotoDeclarationOrUsages() {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const { uri } = editor.document;
    const pos = editor.selection.active;
    /** @type {(vscode.Location | vscode.LocationLink)[]} */
    const defs = (await vscode.commands.executeCommand('vscode.executeDefinitionProvider', uri, pos)) ?? [];
    const locs = defs.map((d) =>
      'targetUri' in d ? new vscode.Location(d.targetUri, d.targetSelectionRange ?? d.targetRange) : d,
    );
    const onDeclaration =
      locs.length === 0 || locs.some((l) => l.uri.toString() === uri.toString() && l.range.contains(pos));
    logger().info(`gotoDeclarationOrUsages: ${locs.length} definitions, onDeclaration=${onDeclaration}`);
    if (onDeclaration) return await run();
    if (locs.length === 1) return await reveal(locs[0], editor.viewColumn, false);
    await vscode.commands.executeCommand('editor.action.revealDefinition'); // several: VS Code's own chooser
  } catch (err) {
    logger().error('gotoDeclarationOrUsages failed', err);
    vscode.window.showErrorMessage(`JB Look: Go to Declaration failed: ${err instanceof Error ? err.message : err}`);
  }
}

async function showUsages() {
  try {
    await run();
  } catch (err) {
    logger().error('showUsages failed', err);
    vscode.window.showErrorMessage(`JB Look: Show Usages failed: ${err instanceof Error ? err.message : err}`);
  }
}

async function run() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    logger().info('invoked with no active editor');
    return;
  }
  const origin = { document: editor.document, selection: editor.selection, viewColumn: editor.viewColumn };
  const pos = editor.selection.active;
  const wordRange = editor.document.getWordRangeAtPosition(pos);
  const name = wordRange ? editor.document.getText(wordRange) : 'symbol';

  /** @type {vscode.Location[]} */
  const all = (await vscode.commands.executeCommand('vscode.executeReferenceProvider', editor.document.uri, pos)) ?? [];
  // Like IntelliJ, list usages only, not the declaration the caret is on.
  const refs = all.filter(
    (r) => !(r.uri.toString() === editor.document.uri.toString() && wordRange && r.range.intersection(wordRange)),
  );
  logger().info(
    `'${name}' at ${vscode.workspace.asRelativePath(editor.document.uri)}:${pos.line + 1}:${pos.character + 1} ` +
      `(${editor.document.languageId}): ${all.length} references, ${refs.length} usages`,
  );

  if (refs.length === 0) {
    vscode.window.showInformationMessage(`No usages of '${name}' found.`);
    return;
  }
  if (refs.length === 1) {
    await reveal(refs[0], origin.viewColumn, false);
    return;
  }

  refs.sort((a, b) => a.uri.fsPath.localeCompare(b.uri.fsPath) || a.range.start.compareTo(b.range.start));

  /** @type {(vscode.QuickPickItem & { location?: vscode.Location })[]} */
  const items = [];
  /** @type {Map<string, vscode.TextDocument>} */
  const docs = new Map();
  let lastFile = '';
  for (const loc of refs) {
    const key = loc.uri.toString();
    if (!docs.has(key)) docs.set(key, await vscode.workspace.openTextDocument(loc.uri));
    const doc = /** @type {vscode.TextDocument} */ (docs.get(key));
    if (key !== lastFile) {
      items.push({ label: vscode.workspace.asRelativePath(loc.uri), kind: vscode.QuickPickItemKind.Separator });
      lastFile = key;
    }
    const text = doc.lineAt(loc.range.start.line).text.trim();
    items.push({
      label: text.length > MAX_LABEL ? `${text.slice(0, MAX_LABEL)}…` : text || '(empty line)',
      description: `${vscode.workspace.asRelativePath(loc.uri).split('/').pop()}:${loc.range.start.line + 1}`,
      location: loc,
    });
  }

  const qp = vscode.window.createQuickPick();
  qp.title = `Usages of '${name}' (${refs.length})`;
  qp.placeholder = 'Type to filter · ↑↓ preview · Enter to open · Esc to go back';
  qp.matchOnDescription = true;
  qp.items = items;

  let accepted = false;
  qp.onDidChangeActive(([item]) => {
    const loc = /** @type {any} */ (item)?.location;
    if (loc) reveal(loc, origin.viewColumn, true);
  });
  qp.onDidAccept(async () => {
    const loc = /** @type {any} */ (qp.selectedItems[0] ?? qp.activeItems[0])?.location;
    if (!loc) return;
    accepted = true;
    qp.hide();
    await reveal(loc, origin.viewColumn, false);
  });
  qp.onDidHide(async () => {
    qp.dispose();
    if (!accepted) {
      await vscode.window.showTextDocument(origin.document, {
        viewColumn: origin.viewColumn,
        selection: origin.selection,
      });
    }
  });
  qp.show();
}

/**
 * @param {vscode.Location} loc
 * @param {vscode.ViewColumn | undefined} viewColumn
 * @param {boolean} preview  true while browsing the list (keeps focus in the popup)
 */
async function reveal(loc, viewColumn, preview) {
  const ed = await vscode.window.showTextDocument(loc.uri, {
    viewColumn,
    selection: loc.range,
    preview: true,
    preserveFocus: preview,
  });
  ed.revealRange(loc.range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
}

module.exports = { showUsages, gotoDeclarationOrUsages };
