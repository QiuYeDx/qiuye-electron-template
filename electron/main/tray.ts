import path from "node:path";
import { Tray, nativeImage, type BrowserWindow } from "electron";
import type { TrayMenuAction } from "@/tray-menu/shared";
import { TrayMenuWindow } from "./tray-menu";

export interface AppTrayOptions {
  tooltip: string;
  /** Folder with favicon.ico (Windows) and tray-icon.png / tray-icon@2x.png (macOS, Linux). */
  publicDir: string;
  preload: string;
  loadMenu: (win: BrowserWindow) => Promise<void>;
  getMainWindow: () => BrowserWindow | null;
  showMainWindow: () => void;
  quit: () => void;
}

function trayIcon(publicDir: string) {
  if (process.platform === "win32") return nativeImage.createFromPath(path.join(publicDir, "favicon.ico"));
  // tray-icon@2x.png is picked up automatically on high-DPI screens.
  return nativeImage.createFromPath(path.join(publicDir, "tray-icon.png"));
}

/**
 * The tray icon and its menu. Windows/Linux: click shows the main window,
 * right-click opens the menu. macOS: both open the menu, like menu bar extras.
 * Add items in `src/tray-menu/TrayMenu.tsx` and, for actions the main process
 * performs, in `TrayMenuAction` and `handleAction` below.
 */
export class AppTray {
  private readonly tray: Tray;
  private readonly menu: TrayMenuWindow;

  constructor(private readonly options: AppTrayOptions) {
    this.menu = new TrayMenuWindow({
      preload: options.preload,
      load: options.loadMenu,
      onAction: this.handleAction,
    });
    this.tray = new Tray(trayIcon(options.publicDir));
    this.tray.setToolTip(options.tooltip);
    this.tray.on("click", () => {
      if (process.platform === "darwin") this.openMenu();
      else options.showMainWindow();
    });
    this.tray.on("right-click", () => this.openMenu());
  }

  openMenu(): void {
    const win = this.options.getMainWindow();
    this.menu.open({ windowVisible: Boolean(win && win.isVisible() && !win.isMinimized()) });
  }

  /** The menu's window, for tests and screenshots. */
  get menuWindow(): BrowserWindow {
    return this.menu.win;
  }

  destroy(): void {
    this.menu.destroy();
    this.tray.destroy();
  }

  private handleAction = (action: TrayMenuAction) => {
    switch (action.type) {
      case "toggleWindow": {
        const win = this.options.getMainWindow();
        if (win && win.isVisible() && !win.isMinimized()) win.hide();
        else this.options.showMainWindow();
        break;
      }
      case "quit":
        this.options.quit();
        break;
    }
  };
}
