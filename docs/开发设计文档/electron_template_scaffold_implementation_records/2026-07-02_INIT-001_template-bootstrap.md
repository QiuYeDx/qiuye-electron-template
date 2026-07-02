# 工作包 INIT-001：Electron 模板初始化闭环

## 基本信息

- 日期：2026-07-02
- 状态：已完成
- 对应执行计划工作包：DOC-001、INIT-001、SHELL-001、UI-001、I18N-001、UPDATE-001、DOC-002、QA-001、GIT-001

## 本次实现内容

- 创建 Electron + React + Vite + TypeScript 模板工程。
- 固定 `packageManager: pnpm@8.7.0`，补齐 `.npmrc`、workspace、TypeScript、Vite、electron-builder、shadcn/ui 配置。
- 迁移并瘦身 FusionKit 的通用应用壳：titlebar、底部导航、ScrollArea、主题 store、截图遮罩主题切换、preload 启动 Loading、shadcn/ui 基础组件、qiuye-ui `DualStateToggle` 与 `ScrollableDialog`。
- 新增主页、关于页、设置页模板，默认四语言 i18n。
- 参考 bili-ticket-node 的轻量更新策略，实现可配置 GitHub Releases 更新检查；仅提示并打开 Releases，不自动下载或安装；可选展示远程 CHANGELOG 条目。
- 新增 README、CHANGELOG、AGENTS、`.env.example`、i18n key 检查脚本。
- 生成 `pnpm-lock.yaml` 并完成构建验证。
- 初始化 git 仓库，并将默认分支改为 `main`。

## 修改文件

- `package.json`
- `pnpm-workspace.yaml`
- `.npmrc`
- `.gitignore`
- `.env.example`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `electron-builder.json`
- `components.json`
- `electron/main/index.ts`
- `electron/main/update.ts`
- `electron/preload/index.ts`
- `electron/electron-env.d.ts`
- `src/**`
- `scripts/check-i18n.mjs`
- `README.md`
- `CHANGELOG.md`
- `AGENTS.md`
- `docs/开发设计文档/electron_template_scaffold_final_design.md`
- `docs/开发设计文档/electron_template_scaffold_execution_plan.md`
- `pnpm-lock.yaml`
- `.git/`

## 接口或数据结构变化

- 新增 renderer 可调用 IPC：
  - `window.ipcRenderer.invoke("window-control", "close" | "minimize" | "toggle-maximize")`
  - `window.ipcRenderer.invoke("open-external", url)`
  - `window.ipcRenderer.invoke("check-update", { includeChangelog?: boolean })`
  - `window.ipcRenderer.send("show-notification", { title, body })`
- 新增更新检查结果类型：
  - `status: "available" | "current" | "error"`
  - 可用更新包含 `currentVersion`、`latestVersion`、`latestTag`、`releaseUrl`、`releasesUrl`、可选 `changelog`。
- 新增本地偏好存储：
  - `qiuye-electron-template-theme`
  - `qiuye-electron-template-update-preferences`
  - `qiuye-electron-template-notification`
  - `qiuye-electron-template-lang`

## 验证结果

执行命令：

```text
node -v && corepack pnpm -v
corepack pnpm install --config.confirmModulesPurge=false
corepack pnpm typecheck
corepack pnpm i18n:check
corepack pnpm build:renderer
corepack pnpm check
git init
git branch -m main
git status --short
```

结果：

- Node.js `v20.19.5`，pnpm `8.7.0`。
- 依赖安装成功并生成 `pnpm-lock.yaml`；pnpm 输出上游 deprecated 警告，未阻塞安装。
- `corepack pnpm typecheck` 通过。
- `corepack pnpm i18n:check` 通过。
- `corepack pnpm build:renderer` 通过，输出 `dist/`、`dist-electron/main/`、`dist-electron/preload/`。
- `corepack pnpm check` 通过。
- `git init` 与 `git branch -m main` 通过；`git status --short` 显示首批模板文件均为未跟踪状态，尚未创建初始 commit。
- Vite 构建提示 renderer chunk 大于 500 kB，当前模板阶段非阻塞。

## 未完成事项

- 尚未创建初始 commit。
- 尚未做 Electron dev 窗口的人工视觉验收；本次未启动常驻 dev 服务。
- 正式发布前仍需按目标项目替换图标、appId、仓库链接和签名/公证配置。

## 下一步建议

- 完成 `GIT-001`：初始化 git 并检查工作区状态。
- 复制为具体项目时，先按 README 的改名清单调整应用标识和更新检查目标仓库。
- 若后续模板体积敏感，可为 About/Settings/Update 进行动态 import 或配置 manual chunks。
