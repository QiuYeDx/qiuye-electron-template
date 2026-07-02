/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_DEV_SERVER_URL?: string;
    VITE_PUBLIC: string;
    VITE_UPDATE_OWNER?: string;
    VITE_UPDATE_REPO?: string;
    VITE_UPDATE_RELEASES_API?: string;
    VITE_UPDATE_RELEASES_URL?: string;
    VITE_UPDATE_CHANGELOG_URL?: string;
  }
}

