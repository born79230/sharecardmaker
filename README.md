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
