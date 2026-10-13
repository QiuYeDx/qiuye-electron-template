# Changelog

All notable changes to this template are documented in this file.

## [Unreleased]

- Template is ready for project-specific renaming and extension.

### Added

- Tray icon with a custom-drawn menu (show / hide the main window, appearance: light / dark / system, quit). Windows can't theme native tray menus, so the menu is a small transparent window that follows the app's theme, language and pointer setting. Its shadow fits inside the window margin, and the menu is cleared before the window hides, so opening it never flashes the previous menu. Click the tray icon to show the window (macOS: opens the menu).
- `rounded-smooth-*` utility (`src/smooth-corners.css`): smooth, iOS-style corners for any radius token or value, the same curve as `@qiuyedx/smooth-corners` at smoothing 0.6, with a plain-radius fallback. `cn()` treats it as conflicting with `rounded-*`.
- Settings → General → Mouse Pointer: clickable elements (buttons, links, menu items, options, tabs, switches) show the hand pointer or the regular arrow. The choice is stored and applied through `html[data-cursor]` before the first render.
- Added `docs/CHANGELOG_TEMPLATE.md` and `changelog:check` (part of `pnpm check`), which fails when the `package.json` version has no non-empty CHANGELOG entry.

### Changed

- Cards, buttons, dialogs, alerts and the page surfaces use smooth corners; ScrollArea viewports inherit the corner shape.
- Theme and pointer settings sync between the app's windows through `storage` events.
- Closing the main window quits the app explicitly on Windows/Linux (the hidden tray menu window would otherwise keep it running); macOS keeps the app in the Dock as before.
- shadcn/ui moved to the radix-nova style: compact controls (32px default buttons and inputs), ring outlines and 16px card spacing. Components use the `radix-ui` package; the qiuye-ui DualStateToggle and ScrollableDialog are updated from the registry. The bottom navigation keeps its 32px items.

### Fixed

- Even corner inset for the theme toggle in the bottom navigation (11px from the right, matching its bottom gap).

## [0.1.0] - 2026-07-02

### Added

- Initialized Electron + React + Vite + TypeScript template.
- Added shadcn/ui basics, qiuye-ui helpers, i18n, theme switching, startup Loading, bottom navigation, About page, and Settings page.
- Added configurable GitHub Releases update checks with optional CHANGELOG display.
- Added macOS/Windows hidden titlebar support and app window controls.
- Added pnpm 8.7.0 project rules, README, AGENTS, and large-feature implementation docs.

