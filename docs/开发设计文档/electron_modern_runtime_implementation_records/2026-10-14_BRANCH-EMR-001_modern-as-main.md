# 工作包 BRANCH-EMR-001：现代版改为主分支

## 基本信息

- 日期：2026-10-14
- 状态：已完成
- 对应执行计划工作包：BRANCH-EMR-001

## 本次实现内容

- 维护重心转到 Electron 41：GitHub 上把原 `main`（Electron 33）改名为 `legacy/electron-33`，再把 `electron-modern` 改名为 `main` 并设为默认分支。
- 改名前核对过：原 `main` 的每个提交在 `electron-modern` 上都有等价的 cherry-pick（`git cherry`），没有遗漏的改动。
- `legacy/electron-33` 追加一个归档说明提交（README 顶部提示、AGENTS.md 说明不再维护），之后不再同步改动。
- 删除已合入两条分支的 `chore/shadcn-nova`。
- `README.md` 新增“分支”一节，`AGENTS.md` 写明维护分支与归档分支，CHANGELOG 记录分支调整。
- 远程 CHANGELOG 地址（`.../main/CHANGELOG.md`）保持不变，改名后读到的是 Electron 41 版本的 CHANGELOG。

## 修改文件

- `README.md`
- `AGENTS.md`
- `CHANGELOG.md`
- `docs/开发设计文档/electron_modern_runtime_final_design.md`
- `docs/开发设计文档/electron_modern_runtime_execution_plan.md`

## 接口或数据结构变化

- 无代码变化。分支名变化：`electron-modern` → `main`，`main` → `legacy/electron-33`。

## 验证结果

执行命令：

```text
git cherry -v electron-modern main
corepack pnpm changelog:check
gh repo view --json defaultBranchRef
git ls-remote --heads origin
```

结果：

- 原 `main` 的提交均已在 `electron-modern` 上有等价提交。
- 默认分支为 `main`，远程只剩 `main` 与 `legacy/electron-33`。

## 未完成事项

- qiuye-fe-cli 的模板版本选项（FOLLOW-CLI-001）仍未实现。

## 下一步建议

- 已有本地克隆执行 `git fetch --prune`，再把本地 `main` 重置到 `origin/main`（原 `main` 的历史已不在 `main` 上，不能直接 fast-forward）。
