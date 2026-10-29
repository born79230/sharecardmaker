import { Marked, Renderer } from 'marked';
import hljs from 'highlight.js/lib/common';

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// WeMD themes style heading spans, list sections and quote levels rather than
// plain Markdown tags. Keep this adapter separate from the original themes.
const themedParser = new Marked({
  breaks: true,
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      return `<h${depth}><span class="prefix"></span><span class="content">${this.parser.parseInline(tokens)}</span><span class="suffix"></span></h${depth}>\n`;
    },
    blockquote({ tokens }) {
      return `<blockquote class="multiquote-1">${this.parser.parse(tokens)}</blockquote>\n`;
    },
    listitem(token) {
      return Renderer.prototype.listitem.call(this, token)
        .replace(/^<li>/, '<li><section>').replace(/<\/li>\n?$/, '</section></li>\n');
    },
    code({ text, lang }) {
      const language = (lang || '').split(/\s+/)[0];
      const highlighted = hljs.getLanguage(language)
        ? hljs.highlight(text, { language, ignoreIllegals: true }).value
        : escapeHtml(text);
      return `<pre class="custom"><code class="hljs">${highlighted}</code></pre>\n`;
    }
  }
});
const standardParser = new Marked({ breaks: true, gfm: true });

// Caller must sanitize the result before placing it in the DOM.
export function renderMarkdown(markdown, typography) {
  return (typography?.startsWith('wemd-') ? themedParser : standardParser).parse(markdown);
}
