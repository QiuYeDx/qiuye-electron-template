# AGENTS.md

## 项目定位

这是个人 Electron 应用模板，用来复制为新项目初始化内容。模板核心只保留应用级通用能力，不把具体业务工具混进基础壳。

## 运行与包管理

- 使用 Node.js `>=18.18.0 <23`，推荐 Node.js `20.x`。
- 项目固定 `packageManager: pnpm@8.7.0`。
- 执行 pnpm 命令时使用 `corepack pnpm ...`。
- 不要用全局新版 pnpm 直接安装或更新依赖，避免重写旧版 lockfile。

## 前端服务进程

- 如果本次工作启动了 `corepack pnpm dev`、`vite preview`、Electron dev server 或其他前端调试服务，回答结束前必须停止这些进程。
- 如果只是构建或类型检查，没有常驻进程，则不需要额外停止。

## 大需求协作

- 中大型需求先维护 `docs/开发设计文档/` 下的最终设计、执行计划和实施记录。
- 每次实现前读取对应 final design 与 execution plan。
- 完成后更新执行计划台账，并写入 implementation record。

## 模板边界

- 不迁移 FusionKit 的字幕、翻译、重命名、AI Agent、模型配置、代理配置等业务逻辑。
- 更新检查只提示并打开 GitHub Releases，不下载、不执行、不安装。
- 新增页面文案要进入 `src/locales/{zh,zh-Hant,en,ja}/`。
- 保留 macOS/Windows titlebar、窗口按钮和拖拽热区的可用性。

## UI 组件

- shadcn/ui 使用 `radix-nova` 风格（`radix-ui` 单包），通过 `pnpm dlx shadcn@latest add <name>` 安装；工具函数从 `@/lib/utils` 导入 `cn`。
- `components/ui/sonner.tsx` 从 `@/store/useThemeStore` 取主题（模板不用 next-themes），重装后要改回来。
- nova 默认值与旧版不同，新增组件时注意：
  - Popover 内容是 `flex flex-col gap-2.5`，Tooltip 内容是 `inline-flex`；内容自带布局时改回块级。
  - DropdownMenuContent 宽度等于触发器（`w-(--radix-dropdown-menu-trigger-width)`），图标按钮触发的菜单应去掉。
  - Select 的选项不在 SelectGroup 里时，把 `p-1` 移到 Viewport 上。
  - SelectTrigger、TabsList 等用 `data-[size=sm]:*`、`group-data-horizontal/*` 变体设置尺寸，覆盖时要写同一变体。
  - Card 描边是外侧 `ring-1`，紧贴滚动区或 `overflow-hidden` 边缘时要留出 1px。
- 可点击元素的鼠标指针由设置项控制（`useCursorStore` → `html[data-cursor]`），不要在组件里单独写死 `cursor-pointer`。

## 变更日志

- 每次发布或合入用户可见的改动，都要更新 `CHANGELOG.md`；格式与分组见 `docs/CHANGELOG_TEMPLATE.md`，沿用项目已有的语言。
- 标题必须是 `## [x.y.z] - 日期或说明`：应用内更新弹窗按此格式解析远程 CHANGELOG。
- 升级 `package.json` 版本号时必须同时写好该版本条目；`corepack pnpm check` 中的 `changelog:check` 会拦截缺失或空的条目。
- 复制模板成为新项目时，清空模板自身的历史，按模板文件从项目的第一个版本开始记录。

## 验证建议

常规修改后至少运行：

```bash
corepack pnpm typecheck
corepack pnpm i18n:check
corepack pnpm changelog:check
```

涉及构建、Electron 主进程或 preload 时运行：

```bash
corepack pnpm build:renderer
```

