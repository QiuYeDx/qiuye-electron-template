# Electron 个人应用模板执行计划

## 使用方式

后续 Agent 开始工作前必须先读：

- `docs/开发设计文档/electron_template_scaffold_final_design.md`
- `docs/开发设计文档/electron_template_scaffold_execution_plan.md`

然后查看下方进度台账，认领最小可完成工作包。完成后更新台账，并在 `docs/开发设计文档/electron_template_scaffold_implementation_records/` 写实施记录。

## 状态规则

只使用以下状态：

- `未开始`
- `进行中`
- `已完成`
- `阻塞`
- `废弃`

只有代码或文档已落地并通过记录中的验证，才能标记 `已完成`。

## 进度台账

| 工作包 | 状态 | 完成日期 | 关键文件 | 验证 | 实施记录 | 未解决事项 |
|---|---|---:|---|---|---|---|
| DOC-001 设计与计划 | 已完成 | 2026-07-02 | `docs/开发设计文档/electron_template_scaffold_final_design.md`; `docs/开发设计文档/electron_template_scaffold_execution_plan.md` | 文档创建并随实现回填 | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | - |
| INIT-001 基础项目配置 | 已完成 | 2026-07-02 | `package.json`; `pnpm-workspace.yaml`; `.npmrc`; `.gitignore`; `tsconfig*.json`; `vite.config.ts`; `electron-builder.json`; `components.json` | `corepack pnpm install`; `corepack pnpm typecheck` | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | - |
| SHELL-001 Electron 与 preload 壳 | 已完成 | 2026-07-02 | `electron/main/index.ts`; `electron/preload/index.ts`; `electron/electron-env.d.ts`; `src/vite-env.d.ts` | `corepack pnpm build:renderer` | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | - |
| UI-001 Renderer 壳与主题动画 | 已完成 | 2026-07-02 | `src/App.tsx`; `src/main.tsx`; `src/index.css`; `src/App.css`; `src/pages/components/*`; `src/store/useThemeStore.ts`; `src/store/useFadeMaskLayer.ts`; `src/utils/common.ts` | `corepack pnpm typecheck`; `corepack pnpm build:renderer` | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | - |
| I18N-001 国际化与页面模板 | 已完成 | 2026-07-02 | `src/i18n/*`; `src/locales/**`; `src/pages/Home.tsx`; `src/pages/About/index.tsx`; `src/pages/Setting/**`; `scripts/check-i18n.mjs` | `corepack pnpm i18n:check` | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | - |
| UPDATE-001 GitHub Releases 更新检查 | 已完成 | 2026-07-02 | `electron/main/update.ts`; `src/components/update/*`; `src/store/useUpdatePreferencesStore.ts`; `src/constants/app.ts` | `corepack pnpm typecheck`; `corepack pnpm build:renderer` | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | 仅提示并打开 release 页面，不自动下载 |
| DOC-002 README/CHANGELOG/AGENTS | 已完成 | 2026-07-02 | `README.md`; `CHANGELOG.md`; `AGENTS.md`; `.env.example` | 文档路径检查；`corepack pnpm check` | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | - |
| GIT-001 初始化 git | 已完成 | 2026-07-02 | `.git/`; branch `main` | `git status --short` | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | 尚未创建初始 commit |
| QA-001 安装与构建验证 | 已完成 | 2026-07-02 | `pnpm-lock.yaml`; `dist/`; `dist-electron/` | `corepack pnpm install`; `corepack pnpm check`; `corepack pnpm build:renderer` | `docs/开发设计文档/electron_template_scaffold_implementation_records/2026-07-02_INIT-001_template-bootstrap.md` | Vite 提示 renderer chunk 大于 500 kB，非阻塞 |

## 依赖顺序

1. 先完成 `DOC-001`，固定模板边界。
2. 再完成 `INIT-001`、`SHELL-001`、`UI-001`，闭合最小可运行 Electron。
3. 再完成 `I18N-001` 和 `UPDATE-001`，补齐通用体验。
4. 最后完成 `DOC-002`、`QA-001`、`GIT-001`。

## 不得违反的约束

- 不迁移 FusionKit 业务工具代码。
- 更新检查只提示并打开 GitHub Releases，不下载、不执行、不安装。
- `packageManager` 固定为 `pnpm@8.7.0`，命令示例使用 `corepack pnpm`。
- 启动过前端/Electron dev 服务时，最终回答前必须停止本次启动的进程。
- 模板页面文案必须进入 i18n 文件，不能大量硬编码。
- macOS 和 Windows titlebar 都必须保留拖拽热区与窗口控制能力。

## 实施记录模板

```markdown
# 工作包 <ID>：<标题>

## 基本信息

- 日期：
- 状态：已完成 / 部分完成 / 阻塞
- 对应执行计划工作包：

## 本次实现内容

-

## 修改文件

-

## 接口或数据结构变化

-

## 验证结果

执行命令：

```text

```

结果：

-

## 未完成事项

-

## 下一步建议

-
```
