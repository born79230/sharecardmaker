# 版本与回滚

2026-10-25 优化前版本：`ba154ab`（Add versioned project state and platform contract）。
Git 标签：`rollback/pre-wemd-2026-10-25`。
优化分支：`codex/wemd-improvements`。

仅查看或运行旧版本，推荐创建独立工作目录，不覆盖当前工作：

```bash
git worktree add ../sharecardmaker-before-wemd rollback/pre-wemd-2026-10-25
cd ../sharecardmaker-before-wemd
npm ci
npm run dev
```

需要将当前分支恢复为旧版时，先保存后续工作，再对优化提交使用 `git revert`。
不要直接执行 `git reset --hard`，它可能丢弃尚未保存的改动。

标签保存源码，不包含浏览器本地草稿或 Agent Reach 安装。此次正文主题字段兼容旧项目；浏览器存储键未变。

本轮优化：三种独立正文主题，表格排版和长代码换行；图片与字体加载等待，安全画布倍率，复制失败复用 Blob 下载。
自动分页、CodeMirror、多草稿与图片资源持久化留待后续迭代。
