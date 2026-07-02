/// <reference types="vite/client" />

import type { IpcRendererEvent } from "electron";

type IpcRendererBridge = {
  on: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void
  ) => Electron.IpcRenderer;
  off: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void
  ) => Electron.IpcRenderer;
  send: (channel: string, ...args: unknown[]) => void;
  invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<T>;
};

type ElectronUtilsBridge = {
  getPathForFile: (file: File) => string;
};

declare global {
  interface Window {
    ipcRenderer: IpcRendererBridge;
    electronUtils: ElectronUtilsBridge;
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_UPDATE_OWNER?: string;
  readonly VITE_UPDATE_REPO?: string;
  readonly VITE_UPDATE_RELEASES_URL?: string;
  readonly VITE_UPDATE_CHANGELOG_URL?: string;
}

