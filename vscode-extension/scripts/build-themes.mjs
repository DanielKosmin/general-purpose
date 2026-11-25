#!/usr/bin/env node
// Generates themes/*.json from the palettes below.
// Edit colors HERE, then run `make themes`. Never hand-edit themes/*.json.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const palettes = {
  dark: {
    file: 'jb-dark-color-theme.json',
    name: 'JB Dark',
    type: 'dark',
    // Values from JetBrains' "Islands Dark" (ManyIslandsDark.theme.json + IslandSchemeDark.xml,
    // intellij-community: platform/platform-resources/src/themes/islands/). Islands is the default
    // theme since 2025.3: dark "islands" (editor, tool windows) float on a lighter window frame.
    ui: {
      frameBg: '#26282C',        // main-window-bg: title bar, tool window stripes, status bar, gaps
      editorBg: '#191A1C',       // editor-bg (island)
      panelBg: '#191A1C',        // tool-window-bg (island): side bar, bottom panel, terminal
      popupBg: '#26282C',        // popup-bg: completion, hover, quick input, menus
      popupBorder: '#33353B',    // popup-border
      notificationBg: '#33353B', // Notification.background
      fg: '#D1D3D9',             // text-default
      editorFg: '#BCBEC4',       // editor-text
      muted: '#9FA2A8',          // text-muted
      subtle: '#73767C',         // text-secondary
      disabled: '#4C4F56',       // text-disabled
      border: '#26282C',         // *.borderColor: same as frame, so islands read as separated
      divider: '#33353B',        // separatorColor
      hover: '#FFFFFF10',        // selection-bg-hovered (lists/trees)
      hoverStrong: '#FFFFFF17',  // core-bg-transparent-hovered (buttons, tabs, toolbars)
      selInactive: '#33353B',    // selection-bg-inactive
      selActive: '#2A4371',      // selection-bg-active
      accent: '#3871E1',         // accent-brand-bg
      accentHover: '#2F5EB9',    // toolbar-selected-bg-hovered
      accentFg: '#FFFFFF',
      link: '#71A1FE',           // text-link
      stripeSelected: '#2E4D89', // toolbar-selected-bg
      tabActiveBg: '#233558',    // tab-selected-bg-active
      tabInactiveBg: '#26282C',  // tab-selected-bg-inactive
      inputBg: '#191A1C',        // control-bg
      inputBorder: '#40434A',    // control-border
      lineHighlight: '#1F2024',  // CARET_ROW_COLOR
      selection: '#214283',      // Darcula editor selection (inherited)
      selectionInactive: '#21428380',
      lineNumber: '#4B5059',
      lineNumberActive: '#A1A3AB',
      findMatch: '#2D543F',      // SEARCH_RESULT_ATTRIBUTES
      findMatchHighlight: '#114957', // TEXT_SEARCH_RESULT_ATTRIBUTES
      wordHighlight: '#373B39',  // IDENTIFIER_UNDER_CARET
      wordHighlightStrong: '#402F33', // WRITE_IDENTIFIER_UNDER_CARET
      bracketMatch: '#43454A',
      indentGuide: '#323438',
      indentGuideActive: '#4E5157',
      foldBg: '#393B40',
      inlayBg: '#393B40',
      inlayFg: '#868A91',
      scrollbar: '#80808059',
      scrollbarHover: '#8080808C',
      scrollbarActive: '#8080808C',
      shadow: '#00000066',
      error: '#F75464',
      warning: '#F2C55C',
      info: '#548AF7',
      added: '#549159',
      modified: '#375FAD',
      deleted: '#868A91',
      gitAdded: '#73BD79',
      gitModified: '#70AEFF',
      gitDeleted: '#6F737A',
      gitUntracked: '#E88F89',
      gitIgnored: '#6F737A',      // greyed out (Islands uses tan #D69A6B; greyed reads closer to excluded folders)
      gitConflict: '#DE6A66',
      diffInserted: '#294436AA',
      diffRemoved: '#484A4A88',
    },
    ansi: {
      black: '#191A1C', red: '#F75464', green: '#5FB865', yellow: '#D6AE58',
      blue: '#548AF7', magenta: '#C77DBB', cyan: '#2AACB8', white: '#CED0D6',
      brightBlack: '#6F737A', brightRed: '#FA7D8A', brightGreen: '#89CC87', brightYellow: '#F2C55C',
      brightBlue: '#7AA7FF', brightMagenta: '#D69ED0', brightCyan: '#5BC6D0', brightWhite: '#FFFFFF',
    },
    syn: {
      fg: '#BCBEC4',
      keyword: '#CF8E6D',
      string: '#6AAB73',
      escape: '#CF8E6D',
      regex: '#42C3D4',
      number: '#2AACB8',
      comment: '#7A7E85',
      docComment: '#5F826B',
      docTag: '#67A37C',
      func: '#56A8F5',
      field: '#C77DBB',
      annotation: '#B3AE60',
      tag: '#D5B778',
      attr: '#BCBEC4',
      typeParam: '#16BAAC',
      self: '#94558D',
      builtin: '#8888C6',
      label: '#32B8AF',
      heading: '#CF8E6D',
      link: '#56A8F5',
      todo: '#8BB33D',
      invalid: '#F75464',
    },
  },
};

const T = '#00000000'; // transparent

function workbench(p) {
  const u = p.ui;
  return {
    // Base
    'foreground': u.fg,
    'descriptionForeground': u.muted,
    'disabledForeground': u.disabled,
    'focusBorder': u.accent,
    'contrastBorder': T,
    'errorForeground': u.error,
    'icon.foreground': u.muted,
    'widget.shadow': u.shadow,
    'selection.background': u.selection,
    'textLink.foreground': u.link,
    'textLink.activeForeground': u.link,
    'textPreformat.foreground': p.syn.keyword,
    'textBlockQuote.background': '#2B2D30',
    'textBlockQuote.border': u.divider,
    'textCodeBlock.background': '#2B2D30',
    'sash.hoverBorder': u.accent,
    'progressBar.background': u.accent,

    // Window chrome
    'titleBar.activeBackground': u.frameBg,
    'titleBar.activeForeground': u.fg,
    'titleBar.inactiveBackground': u.frameBg,
    'titleBar.inactiveForeground': u.muted,
    'titleBar.border': u.border,
    'commandCenter.background': u.frameBg,
    'commandCenter.foreground': u.fg,
    'commandCenter.border': u.divider,
    'commandCenter.activeBackground': u.hoverStrong,
    'commandCenter.activeBorder': u.divider,
    'menu.background': u.popupBg,
    'menu.foreground': u.fg,
    'menu.selectionBackground': u.selActive,
    'menu.selectionForeground': u.fg,
    'menu.separatorBackground': u.popupBorder,
    'menu.border': u.popupBorder,
    'menubar.selectionBackground': u.hoverStrong,

    // Activity bar (tool window stripe)
    'activityBar.background': u.frameBg,
    'activityBar.foreground': u.accentFg,
    'activityBar.inactiveForeground': u.muted,
    'activityBar.border': u.frameBg,
    'activityBar.activeBorder': T,
    'activityBar.activeBackground': u.stripeSelected,
    'activityBar.activeFocusBorder': T,
    'activityBarBadge.background': u.accent,
    'activityBarBadge.foreground': u.accentFg,
    'activityBarTop.foreground': u.fg,
    'activityBarTop.inactiveForeground': u.muted,
    'activityBarTop.activeBorder': u.accent,

    // Side bar (Project tool window)
    'sideBar.background': u.panelBg,
    'sideBar.foreground': u.fg,
    'sideBar.border': u.border,
    'sideBarTitle.foreground': u.fg,
    'sideBarSectionHeader.background': u.panelBg,
    'sideBarSectionHeader.foreground': u.fg,
    'sideBarSectionHeader.border': T,
    'tree.indentGuidesStroke': T,
    'tree.inactiveIndentGuidesStroke': T,

    // Lists & trees
    'list.activeSelectionBackground': u.selActive,
    'list.activeSelectionForeground': u.fg,
    'list.activeSelectionIconForeground': u.fg,
    'list.inactiveSelectionBackground': u.selInactive,
    'list.inactiveSelectionForeground': u.fg,
    'list.focusBackground': u.selActive,
    'list.focusForeground': u.fg,
    'list.focusOutline': T,
    'list.focusAndSelectionOutline': T,
    'list.inactiveFocusOutline': T,
    'list.hoverBackground': u.hover,
    'list.hoverForeground': u.fg,
    'list.highlightForeground': '#538AF9',
    'list.focusHighlightForeground': '#538AF9',
    'list.errorForeground': u.error,
    'list.warningForeground': u.warning,
    'list.dropBackground': u.selActive,

    // Editor groups & tabs
    'editorGroup.border': u.frameBg,
    'editorGroup.dropBackground': u.selection + '55',
    'editorGroupHeader.tabsBackground': u.editorBg,
    'editorGroupHeader.tabsBorder': u.border,
    'editorGroupHeader.noTabsBackground': u.editorBg,
    'tab.activeBackground': u.tabActiveBg,
    'tab.activeForeground': u.fg,
    'tab.activeBorder': T,
    'tab.activeBorderTop': T,
    'tab.unfocusedActiveBorder': T,
    'tab.unfocusedActiveBackground': u.tabInactiveBg,
    'tab.unfocusedActiveForeground': u.fg,
    'tab.inactiveBackground': u.editorBg,
    'tab.inactiveForeground': u.muted,
    'tab.unfocusedInactiveForeground': u.muted,
    'tab.hoverBackground': u.hoverStrong,
    'tab.unfocusedHoverBackground': u.hoverStrong,
    'tab.border': T,
    'tab.lastPinnedBorder': u.divider,
    'tab.modifiedBorder': u.accent,
    'breadcrumb.background': u.editorBg,
    'breadcrumb.foreground': u.muted,
    'breadcrumb.focusForeground': u.fg,
    'breadcrumb.activeSelectionForeground': u.fg,
    'breadcrumbPicker.background': u.popupBg,

    // Editor
    'editor.background': u.editorBg,
    'editor.foreground': u.editorFg,
    'editor.lineHighlightBackground': u.lineHighlight,
    'editor.lineHighlightBorder': T,
    'editor.selectionBackground': u.selection,
    'editor.inactiveSelectionBackground': u.selectionInactive,
    'editor.selectionHighlightBackground': u.wordHighlight,
    'editor.wordHighlightBackground': u.wordHighlight,
    'editor.wordHighlightStrongBackground': u.wordHighlightStrong,
    'editor.findMatchBackground': u.findMatch,
    'editor.findMatchHighlightBackground': u.findMatchHighlight,
    'editor.findRangeHighlightBackground': u.lineHighlight,
    'editor.rangeHighlightBackground': u.lineHighlight,
    'editor.foldBackground': u.foldBg + '80',
    'editorCursor.foreground': u.editorFg,
    'editorLineNumber.foreground': u.lineNumber,
    'editorLineNumber.activeForeground': u.lineNumberActive,
    'editorIndentGuide.background1': u.indentGuide,
    'editorIndentGuide.activeBackground1': u.indentGuideActive,
    'editorWhitespace.foreground': '#6F737A80',
    'editorRuler.foreground': u.indentGuide,
    'editorBracketMatch.background': u.bracketMatch,
    'editorBracketMatch.border': T,
    'editorCodeLens.foreground': u.subtle,
    'editorLink.activeForeground': u.accent,
    'editorInlayHint.background': u.inlayBg,
    'editorInlayHint.foreground': u.inlayFg,
    'editorGutter.background': u.editorBg,
    'editorGutter.addedBackground': u.added,
    'editorGutter.modifiedBackground': u.modified,
    'editorGutter.deletedBackground': u.deleted,
    'editorGutter.foldingControlForeground': u.muted,
    'editorError.foreground': u.error,
    'editorWarning.foreground': u.warning,
    'editorInfo.foreground': u.info,
    'editorHint.foreground': u.muted,
    'editorOverviewRuler.border': T,
    'editorOverviewRuler.errorForeground': u.error,
    'editorOverviewRuler.warningForeground': u.warning,
    'editorOverviewRuler.infoForeground': u.info,
    'editorOverviewRuler.addedForeground': u.added,
    'editorOverviewRuler.modifiedForeground': u.modified,
    'editorOverviewRuler.deletedForeground': u.deleted,
    'editorStickyScroll.background': u.editorBg,
    'editorStickyScroll.shadow': u.shadow,
    'editorStickyScrollHover.background': u.lineHighlight,
    'editorUnnecessaryCode.opacity': '#00000088',

    // Editor widgets (popups)
    'editorWidget.background': u.popupBg,
    'editorWidget.foreground': u.fg,
    'editorWidget.border': u.popupBorder,
    'editorHoverWidget.background': u.popupBg,
    'editorHoverWidget.border': u.popupBorder,
    'editorSuggestWidget.background': u.popupBg,
    'editorSuggestWidget.border': u.popupBorder,
    'editorSuggestWidget.foreground': u.editorFg,
    'editorSuggestWidget.selectedBackground': u.selActive,
    'editorSuggestWidget.selectedForeground': u.fg,
    'editorSuggestWidget.highlightForeground': '#538AF9',
    'editorSuggestWidget.focusHighlightForeground': '#538AF9',
    'peekView.border': u.accent,
    'peekViewEditor.background': u.editorBg,
    'peekViewEditor.matchHighlightBackground': u.findMatch,
    'peekViewResult.background': u.popupBg,
    'peekViewResult.selectionBackground': u.selActive,
    'peekViewResult.matchHighlightBackground': u.findMatch,
    'peekViewTitle.background': u.popupBg,
    'diffEditor.insertedTextBackground': u.diffInserted,
    'diffEditor.removedTextBackground': u.diffRemoved,
    'diffEditor.insertedLineBackground': u.diffInserted,
    'diffEditor.removedLineBackground': u.diffRemoved,
    'merge.currentHeaderBackground': u.diffInserted,
    'merge.incomingHeaderBackground': u.selActive,

    // Inputs & controls
    'input.background': u.inputBg,
    'input.foreground': u.fg,
    'input.border': u.inputBorder,
    'input.placeholderForeground': u.subtle,
    'inputOption.activeBackground': u.selActive,
    'inputOption.activeBorder': u.accent,
    'inputOption.activeForeground': u.fg,
    'inputValidation.errorBackground': u.panelBg,
    'inputValidation.errorBorder': u.error,
    'inputValidation.warningBackground': u.panelBg,
    'inputValidation.warningBorder': u.warning,
    'inputValidation.infoBackground': u.panelBg,
    'inputValidation.infoBorder': u.info,
    'dropdown.background': u.inputBg,
    'dropdown.border': u.inputBorder,
    'dropdown.foreground': u.fg,
    'dropdown.listBackground': u.popupBg,
    'checkbox.background': u.inputBg,
    'checkbox.border': u.inputBorder,
    'checkbox.foreground': u.fg,
    'button.background': u.accent,
    'button.foreground': u.accentFg,
    'button.hoverBackground': u.accentHover,
    'button.border': T,
    'button.secondaryBorder': u.inputBorder,
    'button.secondaryBackground': T,
    'button.secondaryForeground': u.fg,
    'button.secondaryHoverBackground': u.hoverStrong,
    'badge.background': u.accent,
    'badge.foreground': u.accentFg,
    'scrollbar.shadow': T,
    'scrollbarSlider.background': u.scrollbar,
    'scrollbarSlider.hoverBackground': u.scrollbarHover,
    'scrollbarSlider.activeBackground': u.scrollbarActive,
    'keybindingLabel.background': u.hoverStrong,
    'keybindingLabel.foreground': u.fg,
    'keybindingLabel.border': u.divider,
    'keybindingLabel.bottomBorder': u.divider,

    // Quick input (Search Everywhere-ish)
    'quickInput.background': u.popupBg,
    'quickInput.foreground': u.fg,
    'quickInputList.focusBackground': u.selActive,
    'quickInputList.focusForeground': u.fg,
    'quickInputTitle.background': u.popupBg,
    'pickerGroup.border': u.divider,
    'pickerGroup.foreground': u.muted,

    // Panel (bottom tool windows)
    'panel.background': u.panelBg,
    'panel.border': u.border,
    'panelTitle.activeForeground': u.fg,
    'panelTitle.inactiveForeground': u.muted,
    'panelTitle.activeBorder': u.accent,
    'panelInput.border': u.inputBorder,
    'panelSection.border': u.divider,
    'panelSectionHeader.background': u.panelBg,

    // Terminal
    'terminal.background': u.panelBg,
    'terminal.foreground': p.syn.fg,
    'terminal.selectionBackground': u.selection,
    'terminalCursor.foreground': p.syn.fg,
    ...Object.fromEntries(
      Object.entries(p.ansi).map(([k, v]) => [`terminal.ansi${k[0].toUpperCase()}${k.slice(1)}`, v]),
    ),

    // Status bar
    'statusBar.background': u.frameBg,
    'statusBar.foreground': u.muted,
    'statusBar.border': u.frameBg,
    'statusBar.noFolderBackground': u.frameBg,
    'statusBar.noFolderForeground': u.muted,
    'statusBar.debuggingBackground': u.frameBg,
    'statusBar.debuggingForeground': u.muted,
    'statusBar.debuggingBorder': u.accent,
    'statusBarItem.hoverBackground': u.hoverStrong,
    'statusBarItem.activeBackground': u.selInactive,
    'statusBarItem.remoteBackground': u.frameBg,
    'statusBarItem.remoteForeground': u.muted,
    'statusBarItem.prominentBackground': u.hoverStrong,
    'statusBarItem.errorBackground': u.frameBg,
    'statusBarItem.errorForeground': u.error,
    'statusBarItem.warningBackground': u.frameBg,
    'statusBarItem.warningForeground': u.warning,

    // Notifications
    'notifications.background': u.notificationBg,
    'notifications.foreground': u.fg,
    'notifications.border': u.notificationBg,
    'notificationCenterHeader.background': u.notificationBg,
    'notificationToast.border': u.notificationBg,
    'notificationsErrorIcon.foreground': u.error,
    'notificationsWarningIcon.foreground': u.warning,
    'notificationsInfoIcon.foreground': u.info,

    // SCM / git decorations (file status colors)
    'gitDecoration.addedResourceForeground': u.gitAdded,
    'gitDecoration.modifiedResourceForeground': u.gitModified,
    'gitDecoration.deletedResourceForeground': u.gitDeleted,
    'gitDecoration.untrackedResourceForeground': u.gitUntracked,
    'gitDecoration.ignoredResourceForeground': u.gitIgnored,
    'jbLook.dimmedForeground': u.gitIgnored, // label color for src/dimmed-folders.js (set by the extension, not git)
    'gitDecoration.conflictingResourceForeground': u.gitConflict,
    'gitDecoration.renamedResourceForeground': u.gitModified,
    'gitDecoration.stageModifiedResourceForeground': u.gitModified,
    'gitDecoration.stageDeletedResourceForeground': u.gitDeleted,

    // Debug
    'debugToolBar.background': u.popupBg,
    'debugToolBar.border': u.divider,
    'editor.stackFrameHighlightBackground': u.selActive,
    'editor.focusedStackFrameHighlightBackground': u.selActive,
    'debugIcon.breakpointForeground': u.error,

    // Misc
    'welcomePage.tileBackground': u.frameBg,
    'settings.headerForeground': u.fg,
    'settings.modifiedItemIndicator': u.accent,
    'minimap.background': u.editorBg,
    'minimapSlider.background': u.scrollbar,
    'minimapSlider.hoverBackground': u.scrollbarHover,
    'minimapSlider.activeBackground': u.scrollbarActive,
  };
}

function tokenColors(s) {
  const r = (name, scope, foreground, fontStyle) => ({
    name,
    ...(scope.length && { scope }),
    settings: { ...(foreground && { foreground }), ...(fontStyle !== undefined && { fontStyle }) },
  });
  return [
    r('Default', [], s.fg),
    r('Comments', ['comment', 'punctuation.definition.comment'], s.comment, ''),
    r('Doc comments', ['comment.block.documentation', 'comment.block.javadoc', 'string.quoted.docstring', 'comment.block.documentation punctuation.definition.comment'], s.docComment, 'italic'),
    r('Doc tags', ['storage.type.class.jsdoc', 'storage.type.class.javadoc', 'keyword.other.documentation', 'comment.block.documentation storage.type'], s.docTag, 'italic bold'),
    r('Keywords', ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python', 'keyword.operator.wordlike', 'keyword.operator.instanceof', 'keyword.operator.typeof', 'keyword.operator.delete', 'keyword.operator.in', 'keyword.operator.of', 'keyword.operator.sizeof', 'constant.language', 'variable.language.this', 'variable.language.super', 'support.type.primitive', 'support.type.builtin', 'keyword.type', 'entity.name.type.primitive', 'storage.type.primitive', 'storage.type.built-in'], s.keyword),
    r('Operators & punctuation', ['keyword.operator', 'punctuation', 'meta.brace', 'storage.type.function.arrow'], s.fg),
    r('Strings', ['string', 'string.quoted', 'string.template', 'punctuation.definition.string', 'markup.inline.raw.string'], s.string),
    r('String escapes & interpolation', ['constant.character.escape', 'constant.character.format.placeholder', 'punctuation.definition.template-expression', 'punctuation.section.embedded', 'meta.template.expression punctuation', 'meta.fstring.python constant.character.format', 'storage.type.format.python'], s.escape),
    r('Regex', ['string.regexp', 'constant.other.character-class.regexp', 'keyword.operator.quantifier.regexp'], s.regex),
    r('Numbers', ['constant.numeric', 'keyword.other.unit'], s.number),
    r('Function declarations', ['entity.name.function', 'meta.definition.method entity.name.function', 'meta.function entity.name.function', 'entity.name.function.constructor'], s.func),
    r('Function calls', ['meta.function-call entity.name.function', 'meta.method-call entity.name.function', 'support.function', 'meta.function-call.generic'], s.fg),
    r('Types & classes', ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class', 'support.class', 'support.type', 'entity.name.namespace', 'entity.name.module'], s.fg),
    r('Type parameters', ['entity.name.type.parameter', 'meta.type.parameters entity.name.type', 'storage.type.generic'], s.typeParam),
    r('Fields & properties', ['variable.other.property', 'variable.other.object.property', 'meta.property.object', 'variable.other.member', 'entity.name.variable.field', 'support.variable.property', 'meta.object-literal.key', 'variable.other.field'], s.field),
    r('Constants & enum members', ['variable.other.constant', 'variable.other.enummember', 'entity.name.constant', 'constant.other.caps', 'support.constant'], s.field, 'italic'),
    r('Parameters', ['variable.parameter'], s.fg),
    r('self / cls', ['variable.parameter.function.language.special.self', 'variable.language.special.self', 'variable.parameter.function.language.special.cls', 'variable.language.special.cls'], s.self),
    r('Builtins', ['support.function.builtin', 'support.type.python', 'support.function.magic', 'support.variable.magic'], s.builtin),
    r('Annotations & decorators', ['meta.annotation', 'storage.type.annotation', 'punctuation.definition.annotation', 'entity.name.function.decorator', 'meta.decorator', 'punctuation.decorator', 'meta.function.decorator', 'meta.attribute.rust', 'meta.attribute'], s.annotation),
    r('Labels', ['entity.name.label', 'punctuation.definition.label'], s.label),
    r('Tags (HTML/XML/JSX)', ['entity.name.tag', 'support.class.component', 'punctuation.definition.tag'], s.tag),
    r('Tag attributes', ['entity.other.attribute-name'], s.attr),
    r('CSS selectors', ['entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css', 'entity.other.attribute-name.pseudo-class', 'entity.name.tag.css', 'entity.other.attribute-name.class', 'entity.other.attribute-name.id'], s.tag),
    r('CSS properties', ['support.type.property-name', 'support.type.vendored.property-name'], s.field),
    r('CSS values', ['support.constant.property-value', 'support.constant.font-name', 'constant.other.color'], s.string),
    r('JSON keys', ['support.type.property-name.json', 'meta.mapping.key.json string', 'support.type.property-name.toml'], s.field),
    r('YAML keys', ['entity.name.tag.yaml', 'meta.mapping.key.yaml', 'support.type.property-name.yaml'], s.keyword),
    r('YAML anchors', ['entity.name.type.anchor.yaml', 'variable.other.alias.yaml'], s.field),
    r('Markdown headings', ['markup.heading', 'entity.name.section.markdown', 'markup.heading.setext'], s.heading, 'bold'),
    r('Markdown bold', ['markup.bold'], undefined, 'bold'),
    r('Markdown italic', ['markup.italic'], undefined, 'italic'),
    r('Markdown code', ['markup.inline.raw', 'markup.fenced_code.block', 'markup.raw'], s.fg),
    r('Markdown links', ['markup.underline.link', 'string.other.link', 'meta.link.inline.markdown'], s.link),
    r('TODO / FIXME', ['comment keyword.codetag', 'keyword.codetag.notation', 'comment.line.todo', 'storage.type.class.todo'], s.todo, 'italic'),
    r('Markdown quotes & lists', ['markup.quote', 'punctuation.definition.list.begin.markdown', 'punctuation.definition.quote.begin.markdown'], s.comment),
    r('Diff inserted', ['markup.inserted'], s.string),
    r('Diff deleted', ['markup.deleted'], s.invalid),
    r('Diff changed', ['markup.changed'], s.link),
    r('Shell variables', ['variable.other.normal.shell', 'variable.other.positional.shell', 'variable.other.special.shell', 'punctuation.definition.variable.shell'], s.field),
    r('Env file keys', ['variable.other.env', 'variable.other.dotenv'], s.field),
    r('Invalid', ['invalid', 'invalid.illegal'], s.invalid),
  ];
}

function semanticTokenColors(s) {
  return {
    'function.declaration': s.func,
    'method.declaration': s.func,
    'function': s.fg,
    'method': s.fg,
    'class': s.fg,
    'interface': s.fg,
    'type': s.fg,
    'struct': s.fg,
    'namespace': s.fg,
    'typeParameter': s.typeParam,
    'parameter': s.fg,
    'variable': s.fg,
    'property': s.field,
    'enumMember': { foreground: s.field, fontStyle: 'italic' },
    'property.static': { foreground: s.field, fontStyle: 'italic' },
    'method.static': { foreground: s.fg, fontStyle: 'italic' },
    'variable.static': { foreground: s.field, fontStyle: 'italic' },
    'decorator': s.annotation,
    'macro': s.annotation,
    'label': s.label,
    'selfParameter': s.self,
    'selfKeyword': s.self,
    'keyword': s.keyword,
    'builtinConstant': s.keyword,
    'number': s.number,
    'string': s.string,
    'regexp': s.regex,
    'comment': s.comment,
  };
}

mkdirSync(join(ROOT, 'themes'), { recursive: true });
for (const p of Object.values(palettes)) {
  const theme = {
    $schema: 'vscode://schemas/color-theme',
    name: p.name,
    type: p.type,
    semanticHighlighting: true,
    colors: workbench(p),
    tokenColors: tokenColors(p.syn),
    semanticTokenColors: semanticTokenColors(p.syn),
  };
  const out = join(ROOT, 'themes', p.file);
  writeFileSync(out, JSON.stringify(theme, null, 2) + '\n');
  console.log(`  wrote themes/${p.file}`);
}
