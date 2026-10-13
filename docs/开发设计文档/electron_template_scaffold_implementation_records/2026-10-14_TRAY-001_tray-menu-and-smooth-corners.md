# 工作包 TRAY-001：自绘托盘菜单与平滑圆角

## 基本信息

- 日期：2026-10-14
- 状态：已完成（`main`，同步到 `electron-modern`）
- 来源：把 PotSubOverlay 的自绘托盘菜单（含阴影裁切与打开闪烁的修复）和平滑圆角做法沉淀到模板

## 本次实现内容

- **托盘**：`AppTray`（`electron/main/tray.ts`）创建托盘图标并处理菜单动作；Windows / Linux 单击显示主窗口、右键打开菜单，macOS 单击打开菜单。图标：Windows 用 `public/favicon.ico`，macOS / Linux 用 `public/tray-icon.png`（@2x 自动用于高分屏）。
- **菜单窗口**：`TrayMenuWindow`（`electron/main/tray-menu.ts`）是透明、置顶、不进任务栏的小窗口，创建一次、每次打开时按页面测得的尺寸移到光标旁（Windows 向左上展开，靠近工作区边缘时翻转，macOS 自然向下）。
- **关闭握手**：`hide()` 发 `tray-menu:hide` → 页面 100ms 淡出、等两帧（空帧上屏）后回 `tray-menu:hidden` → `win.hide()`，最多等 250ms；淡出中重新打开会取消隐藏。原因：Windows 重新显示窗口时会先放出隐藏前的最后一帧，直接隐藏会让下次打开先闪一下旧菜单。
- **阴影**：透明边距 24px（`TRAY_MENU_SHADOW_MARGIN`，主进程定位与页面共用），两层阴影（`0 1px 2px` + `0 8px 20px -4px`）都在边距内淡完；点击边距等同点击菜单外部。
- **菜单页**：显示 / 隐藏主窗口、外观（浅色 / 深色 / 跟随系统，单选）、退出；面板 12px 平滑圆角、内边距 4px、菜单项 8px，高亮与面板同心。语言、主题、鼠标指针每次打开时从 localStorage 重新读取。
- **跨窗口同步**：`useThemeStore`、`useCursorStore` 监听 `storage` 事件；在菜单里改主题，主窗口随之切换。
- **生命周期**：隐藏的菜单窗口会让 `window-all-closed` 不再触发，主窗口 `closed` 时在 Windows / Linux 显式退出；`second-instance`、`activate` 统一走 `showMainWindow()`（不再取 `getAllWindows()[0]`，那可能是菜单窗口）；`before-quit` 销毁托盘。
- **平滑圆角**：从 PotSubOverlay 引入 `rounded-smooth-*` 工具类与 `cn()` 的 tailwind-merge 配置；按钮、卡片、弹窗、提示框和页面表面改用平滑圆角，ScrollArea 视口继承 `corner-shape`。
- **主窗口四角**：窗口外轮廓由系统绘制（Windows 11 固定 8px 圆角），无法放大；靠角元素只有右下的主题切换（36px 圆形，距右、下各 11px），直边内缩已相等，圆形在 8px 窗口角里无法同心，保持现状。

## 验证结果

```text
corepack pnpm check        typecheck / i18n / changelog 通过
vite build                 输出 tray-menu.html、preload/menu.mjs、tray-icon*.png
Playwright 端到端          打开：5 项、跟随系统已勾选、指针设置生效
                           Esc 关闭：30ms 不透明度 0.46（淡出中），200ms 窗口已隐藏
                           菜单选「深色」→ 主窗口 html.dark；再次打开勾选「深色」
                           隐藏主窗口 → 菜单项变为「显示主窗口」→ 再点恢复显示
                           退出 → 进程退出码 0
截图                       浅 / 深色菜单阴影完整；首项、末项高亮与面板圆角同心；
                           首页 / 关于 / 设置页浅深色平滑圆角正常
```

## 未完成事项

- macOS 与 Linux 的托盘图标、菜单定位和 panel 窗口行为未实机验证。
