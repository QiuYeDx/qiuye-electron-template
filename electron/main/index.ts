import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Notification,
  shell,
} from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { AppTray } from "./tray";
import { setupUpdateIPC } from "./update";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

const START_LOADING_PROGRESS_CHANNEL = "qiuye-template-start-loading-progress";
const preload = path.join(__dirname, "../preload/index.mjs");
const menuPreload = path.join(__dirname, "../preload/menu.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const APP_TITLE = process.env.APP_NAME || "QiuYe Electron Template";

if (os.release().startsWith("6.1")) {
  app.disableHardwareAcceleration();
}

if (process.platform === "win32") {
  app.setAppUserModelId(app.getName());
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
let tray: AppTray | null = null;

function showMainWindow() {
  if (!win || win.isDestroyed()) {
    void createWindow();
    return;
  }
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

async function createWindow() {
  win = new BrowserWindow({
    title: APP_TITLE,
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    width: 1080,
    height: 786,
    minWidth: 786,
    minHeight: 540,
    resizable: true,
    show: false,
    titleBarStyle: "hidden",
    ...(process.platform === "darwin"
      ? { trafficLightPosition: { x: 15, y: 11.5 } }
      : {}),
    webPreferences: {
      preload,
    },
  });

  const startLoadingProgress = () => {
    if (!win || win.webContents.isDestroyed()) return;
    win.webContents.send(START_LOADING_PROGRESS_CHANNEL);
  };

  win.once("ready-to-show", () => {
    if (!win || win.isDestroyed()) return;
    win.show();
    startLoadingProgress();
  });

  win.webContents.on("dom-ready", () => {
    if (win?.isVisible()) {
      startLoadingProgress();
    }
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(indexHtml);

    win.webContents.on("before-input-event", (event, input) => {
      const isCtrlOrCmd = input.control || input.meta;
      const key = input.key.toLowerCase();

      if (input.key === "F5" || (isCtrlOrCmd && key === "r")) {
        event.preventDefault();
        return;
      }

      if (input.key === "F12" || (isCtrlOrCmd && input.shift && key === "i")) {
        event.preventDefault();
      }
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate([]));
  }

  // The hidden tray menu window keeps window-all-closed from firing, so
  // closing the main window quits here (macOS keeps the app, as before).
  win.on("closed", () => {
    win = null;
    if (process.platform !== "darwin") app.quit();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  void createWindow();
  setupUpdateIPC();
  tray = new AppTray({
    tooltip: APP_TITLE,
    publicDir: process.env.VITE_PUBLIC,
    preload: menuPreload,
    loadMenu: (menuWin) =>
      VITE_DEV_SERVER_URL
        ? menuWin.loadURL(`${VITE_DEV_SERVER_URL}tray-menu.html`)
        : menuWin.loadFile(path.join(RENDERER_DIST, "tray-menu.html")),
    getMainWindow: () => (win && !win.isDestroyed() ? win : null),
    showMainWindow,
    quit: () => app.quit(),
  });
});

app.on("before-quit", () => {
  tray?.destroy();
  tray = null;
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => showMainWindow());

// macOS: clicking the Dock icon brings the main window back (or recreates it).
app.on("activate", () => showMainWindow());

type WindowControlAction = "close" | "minimize" | "toggle-maximize";

ipcMain.handle("window-control", (event, action: WindowControlAction) => {
  const targetWindow = BrowserWindow.fromWebContents(event.sender);
  if (!targetWindow) {
    return { success: false };
  }

  switch (action) {
    case "minimize":
      targetWindow.minimize();
      return { success: true };
    case "toggle-maximize":
      if (targetWindow.isMaximized()) {
        targetWindow.unmaximize();
      } else {
        targetWindow.maximize();
      }
      return { success: true, isMaximized: targetWindow.isMaximized() };
    case "close":
      targetWindow.close();
      return { success: true };
    default:
      return { success: false };
  }
});

ipcMain.handle("open-external", async (_event, url: string) => {
  if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
    return { success: false, message: "Only http(s) and mailto URLs are allowed." };
  }

  await shell.openExternal(url);
  return { success: true };
});

ipcMain.on(
  "show-notification",
  (_event, { title, body }: { title: string; body: string }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  }
);

