# 截图生成器

一个本地运行的分享图生成器，可以把 Markdown 文本、帖子、代码片段或图片排版成适合社交媒体发布的 PNG。

## 功能

- Text / Post / Code / Image 四种模式
- Markdown 渲染和安全过滤
- 背景、阴影、比例、圆角、边框宽度可调
- Glass / Light / Dark 三种卡片外观
- No pad、Edge to edge、完全无边框导出
- 自定义文字水印
- Copy PNG 和 Download PNG

## 本地运行

```bash
npm install
npm run dev
```

默认地址：

```text
http://127.0.0.1:5173/
```

## 构建

```bash
npm run build
```

构建产物会输出到 `dist/`，该目录不会提交到 git。

## 技术栈

- React
- Vite
- html-to-image
- marked
- DOMPurify
- lucide-react
