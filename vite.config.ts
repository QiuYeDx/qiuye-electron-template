import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json";

export default defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });

  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || Boolean(process.env.VSCODE_DEBUG);
  const appVersion = process.env.VITE_APP_VERSION ?? pkg.version;
  const dependencyNames = Object.keys(pkg.dependencies ?? {});
  const preloadExternal = dependencyNames.filter(
    (dependencyName) => dependencyName !== "motion"
  );
  const srcAlias = path.join(__dirname, "src");

  return {
    resolve: {
      alias: {
        "@": srcAlias,
      },
    },
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    },
    plugins: [
      react(),
      tailwindcss(),
      electron({
        main: {
          entry: "electron/main/index.ts",
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log("[startup] Electron App");
            } else {
              args.startup();
            }
          },
          vite: {
            resolve: {
              alias: {
                "@": srcAlias,
              },
            },
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: {
                external: dependencyNames,
              },
            },
          },
        },
        preload: {
          input: "electron/preload/index.ts",
          vite: {
            resolve: {
              alias: {
                "@": srcAlias,
              },
            },
            build: {
              sourcemap: sourcemap ? "inline" : undefined,
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: preloadExternal,
              },
            },
          },
        },
        renderer: {},
      }),
    ],
    server: process.env.VSCODE_DEBUG
      ? (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: Number(url.port),
        };
      })()
      : undefined,
    clearScreen: false,
  };
});
