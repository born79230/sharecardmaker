# 截图生成器

一个本地运行的分享图生成器，可以把 Markdown 文本、帖子、代码片段或图片排版成适合社交媒体发布的 PNG。

## 功能

- Text / Post / Code / Image 四种模式
- Markdown 渲染和安全过滤
- 背景、Scene、阴影、比例、圆角、边框宽度可调
- Glass / Light / Dark 三种卡片外观
- No pad、Edge to edge、完全无边框导出
- 自定义文字、定位、日期水印
- Copy PNG 和 Download PNG
- 基础 PWA 元数据，方便后续移动端安装体验扩展

## 本地运行

```bash
npm install
npm run dev
```

默认地址：

```text
http://127.0.0.1:5173/sharecardmaker/
```

## 构建

```bash
npm run build
```

构建产物会输出到 `dist/`，该目录不会提交到 git。

面向 Capacitor / Tauri 等 App 壳的相对路径构建：

```bash
npm run build:app
```

提交前完整检查：

```bash
npm run check
```

该命令会运行纯逻辑测试、GitHub Pages 构建和 App 壳构建。

## App 化准备

未来 PWA、桌面壳或移动端壳的迁移路线见 [`docs/app-readiness-plan.md`](docs/app-readiness-plan.md)。

当前项目状态会以带版本号的 Project 模型保存在浏览器本地。上传图片的数据 URL 不写入 localStorage，未来 App 端应改由 IndexedDB 或原生文件系统保存图片资源。

## 技术栈

- React
- Vite
- html-to-image
- marked
- DOMPurify
- lucide-react

## Markdown 排版主题

Text 模式的「正文排版」包含 3 套 ShareCardMaker 适配主题及 WeMD 的全部 17 套内置主题：
默认主题、数据蓝图、东方笺谱、清晰指南、留白画册、学术论文、极光玻璃、包豪斯、赛博朋克、知识库、黑金奢华、莫兰迪森林、编辑部手记、新粗野主义、购物小票、落日胶片、主题模板。

原主题的标题装饰、列表、引用、表格和代码配色已接入，代码块支持常见语言高亮；主题随项目自动保存。
主题使用自身配色，卡片外观仍单独控制。数学公式、滑动图组等 WeMD 专有语法不包含在本次主题移植中。
来源版本与 MIT 许可见 `THIRD_PARTY_NOTICES.md`。

## 复制到公众号

在 Text 模式选择正文主题后，点击底部「复制到公众号」，再到公众号编辑器正文区域按 `⌘V` / `Ctrl+V`。
复制内容为 HTML 富文本及纯文本，正文样式已内联，章节编号已转为文字；不包含截图背景、水印或卡片边框。
本地图片需要在公众号编辑器重新上传。公众号可能清理部分特殊样式，发布前请使用其预览检查最终效果。
