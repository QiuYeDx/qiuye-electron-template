// Shared by the main process (electron/main/tray*.ts) and the tray menu page:
// no Node or DOM APIs here.

/** Transparent margin around the menu surface, sized to hold its whole shadow. */
export const TRAY_MENU_SHADOW_MARGIN = 24;

/** What the main process tells the menu each time it opens. */
export interface TrayMenuState {
  /** Whether the main window is on screen, so the first item can show or hide it. */
  windowVisible: boolean;
}

/** What a menu item asks the main process to do. Theme changes are handled in the page. */
export type TrayMenuAction = { type: "toggleWindow" } | { type: "quit" };
