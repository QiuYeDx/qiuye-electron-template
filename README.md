# QiuYe Electron Template

个人 Electron 应用模板，用来复制为新项目的初始化内容。它保留了通用桌面壳体验：React + Vite + Electron、shadcn/ui、qiuye-ui 小组件、i18n、深浅色主题切换动画、启动 Loading、底部导航、关于页、设置页，以及基于 GitHub Releases 的轻量更新检查。

## 环境

- Node.js: `>=18.18.0 <23`，推荐 `20.x`
- pnpm: `8.7.0`

建议统一使用：

```bash
corepack enable
corepack prepare pnpm@8.7.0 --activate
corepack pnpm install --config.confirmModulesPurge=false
```

## 常用命令

```bash
corepack pnpm dev
corepack pnpm typecheck
corepack pnpm i18n:check
corepack pnpm changelog:check
corepack pnpm build:renderer
corepack pnpm release:dir
corepack pnpm release:mac
corepack pnpm release:win
```

`dev` 会启动 Vite + Electron；如果由 AI Agent 启动调试服务，结束前必须停止对应进程。

## 复制成新项目后优先修改

1. `package.json`: `name`、`productName`、`version`、`description`、`author`、`template.update`。
2. `electron-builder.json`: `appId`、`shortcutName`、图标和产物命名。
3. `.env.example`: GitHub Releases 目标仓库。
4. `src/constants/app.ts`: 应用名、仓库、作者链接、联系方式。
5. `src/assets/app-logo.svg`、`build/icon.*`、`public/favicon.ico`、`public/tray-icon.png` / `tray-icon@2x.png`（macOS / Linux 托盘图标，16 / 32px）。
6. `README.md`、`CHANGELOG.md`、`AGENTS.md`；`CHANGELOG.md` 清空模板自身的历史，按 `docs/CHANGELOG_TEMPLATE.md` 从项目的第一个版本开始记录。

## 目录结构

```text
electron/          Electron main/preload
src/components/    shadcn/ui、qiuye-ui、更新弹窗
src/pages/         Home/About/Setting 模板页
src/tray-menu/     托盘菜单页面（自绘，见下文）
src/i18n/          i18next 初始化与资源聚合
src/locales/       zh、zh-Hant、en、ja 文案
src/store/         Zustand 状态与偏好
docs/开发设计文档/  大需求设计、执行计划、实施记录
build/             electron-builder 图标资源
public/            静态资源
scripts/           项目检查脚本
```

## 托盘菜单

Windows 不允许给原生托盘菜单换主题，所以模板自绘了一个：`electron/main/tray.ts`（托盘图标与动作）+ `electron/main/tray-menu.ts`（透明菜单窗口）+ `tray-menu.html` / `src/tray-menu/`（页面）。

- 默认菜单项：显示 / 隐藏主窗口、外观（浅色 / 深色 / 跟随系统）、退出。Windows / Linux 单击托盘图标显示主窗口、右键打开菜单；macOS 单击即打开菜单。
- 新增菜单项：在 `src/tray-menu/TrayMenu.tsx` 加一行；需要主进程执行的动作，同时加到 `src/tray-menu/shared.ts` 的 `TrayMenuAction` 和 `tray.ts` 的 `handleAction`。文案放在 `common:tray.*`。
- 菜单跟随应用的主题、语言和鼠标指针设置；在菜单里改主题会写入 localStorage，主窗口通过 `storage` 事件同步。
- 不需要托盘的项目：删掉 `index.ts` 里创建 `AppTray` 的几行和上述文件即可。

## 平滑圆角

`rounded-smooth-*`（`src/smooth-corners.css`）是带平滑曲线的 `rounded-*`：`rounded-smooth-xl`、`rounded-smooth-[22px]`、`rounded-smooth-[var(--r)]`。支持 `corner-shape` 时半径放大 1.6 倍并画成 superellipse，否则保持原半径。卡片、按钮、弹窗等表面都已使用；胶囊和圆形仍用 `rounded-full`。嵌套表面按“外半径 = 内半径 + 间距”取值。

## 更新检查

模板默认使用 GitHub Releases API：

- 选择最高稳定版本。
- 比较当前 `package.json`/Electron 版本。
- 只提示并打开 Releases 页面。
- 不下载、不执行、不自动安装。
- 可选读取远程 `CHANGELOG.md` 并展示相关版本条目。

可通过环境变量覆盖：

```bash
VITE_UPDATE_OWNER=QiuYeDx
VITE_UPDATE_REPO=qiuye-electron-template
VITE_UPDATE_RELEASES_URL=https://github.com/QiuYeDx/qiuye-electron-template/releases
VITE_UPDATE_CHANGELOG_URL=https://raw.githubusercontent.com/QiuYeDx/qiuye-electron-template/main/CHANGELOG.md
```

## 变更日志

- 发布或合入用户可见的改动时更新 `CHANGELOG.md`，格式与常用分组见 [docs/CHANGELOG_TEMPLATE.md](docs/CHANGELOG_TEMPLATE.md)。
- 版本标题使用 `## [x.y.z] - 日期或说明`，更新检查会读取远程 CHANGELOG 并展示相关版本条目。
- `corepack pnpm changelog:check`（已包含在 `check` 中）要求 `package.json` 的当前版本在 CHANGELOG 中有非空条目。

## i18n

默认命名空间：

- `common`
- `home`
- `about`
- `setting`

新增页面或文案后同步更新 `src/locales/{zh,zh-Hant,en,ja}/`，并运行：

```bash
corepack pnpm i18n:check
```

## 设计与实施记录

本模板初始化设计见：

- `docs/开发设计文档/electron_template_scaffold_final_design.md`
- `docs/开发设计文档/electron_template_scaffold_execution_plan.md`

后续中大型改动继续沿用该目录下的设计、执行计划和实施记录流程。

