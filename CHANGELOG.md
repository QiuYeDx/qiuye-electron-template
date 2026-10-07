# Changelog

All notable changes to this template are documented in this file.

## [Unreleased]

- Template is ready for project-specific renaming and extension.

### Added

- Added `docs/CHANGELOG_TEMPLATE.md` and `changelog:check` (part of `pnpm check`), which fails when the `package.json` version has no non-empty CHANGELOG entry.

### Fixed

- Even corner inset for the theme toggle in the bottom navigation (11px from the right, matching its bottom gap).

## [0.1.0] - 2026-07-02

### Added

- Initialized Electron + React + Vite + TypeScript template.
- Added shadcn/ui basics, qiuye-ui helpers, i18n, theme switching, startup Loading, bottom navigation, About page, and Settings page.
- Added configurable GitHub Releases update checks with optional CHANGELOG display.
- Added macOS/Windows hidden titlebar support and app window controls.
- Added pnpm 8.7.0 project rules, README, AGENTS, and large-feature implementation docs.

