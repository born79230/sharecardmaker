// Copy the rendered article, not the surrounding screenshot scene. WeChat
// removes stylesheets/classes, so resolve the active theme in a light document
// and materialize pseudo elements before writing rich HTML to the clipboard.
const STYLE_PROPERTIES = `display flex-direction align-items justify-content gap box-sizing color background-color background-image font-family font-size font-style font-weight font-variant line-height letter-spacing word-spacing text-align text-indent text-decoration text-decoration-color text-decoration-style text-decoration-thickness text-underline-offset text-transform white-space word-break overflow-wrap vertical-align margin-top margin-right margin-bottom margin-left padding-top padding-right padding-bottom padding-left border-top border-right border-bottom border-left border-radius border-collapse border-spacing table-layout list-style-type list-style-position opacity box-shadow writing-mode text-orientation`.split(' ');

export function resolvePseudoText(content, index = 1) {
  if (!content || /^(none|normal)$/.test(content)) return '';
  return content.replace(/counter\([^,)]*(?:,\s*([^)]*))?\)/g, (_, format) => format?.trim() === 'decimal-leading-zero' ? String(index).padStart(2, '0') : String(index))
    .replace(/"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'/g, (_, double, single) => (double ?? single).replace(/\\([0-9a-f]{1,6})\s?/gi, (match, code) => String.fromCodePoint(parseInt(code, 16))).replace(/\\(.)/g, '$1'));
}

function inlineStyle(style) {
  return STYLE_PROPERTIES.map((property) => `${property}:${style.getPropertyValue(property)};`).join('');
}

export function buildWechatArticle(source) {
  const doc = source.ownerDocument;
  const view = doc.defaultView;
  const host = doc.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:677px;background:#fff;pointer-events:none;';
  host.setAttribute('aria-hidden', 'true');
  const article = source.cloneNode(true);
  host.append(article);
  doc.body.append(host);
  try {
    const elements = [article, ...article.querySelectorAll('*')];
    let chapter = 0;
    // Snapshot every style before changing the DOM or removing class names.
    const snapshots = elements.map((element) => {
      if (element.tagName === 'H2') chapter++;
      const pseudo = ['::before', '::after'].map((selector) => {
        const style = view.getComputedStyle(element, selector);
        return { text: resolvePseudoText(style.content, chapter), css: inlineStyle(style) };
      });
      return { element, checked: element.checked, css: inlineStyle(view.getComputedStyle(element)), pseudo };
    });
    for (const { element, checked, css, pseudo } of snapshots) {
      element.setAttribute('style', css);
      for (const attr of Array.from(element.attributes)) {
        if (!['style', 'href', 'src', 'alt', 'title', 'colspan', 'rowspan'].includes(attr.name)) element.removeAttribute(attr.name);
      }
      if (element.tagName === 'INPUT') {
        element.replaceWith(doc.createTextNode(checked ? '☑ ' : '☐ '));
        continue;
      }
      pseudo.forEach(({ text, css }, index) => {
        if (!text || /^(url|attr|counter)\(/.test(text)) return;
        const span = doc.createElement('span');
        span.textContent = text;
        span.style.cssText = css;
        if (index === 0) element.prepend(span); else element.append(span);
      });
      if (['IMG', 'TABLE', 'PRE'].includes(element.tagName)) element.style.maxWidth = '100%';
      if (element.tagName === 'PRE' || element.tagName === 'CODE') {
        element.style.whiteSpace = 'pre-wrap';
        element.style.overflowWrap = 'anywhere';
      }
    }
    article.style.width = '100%';
    article.style.maxWidth = '100%';
    article.style.backgroundColor = '#fff';
    const section = doc.createElement('section');
    section.style.cssText = article.style.cssText;
    section.append(...article.childNodes);
    return {
      html: section.outerHTML,
      text: source.innerText || source.textContent || '',
      hasLocalImages: !!source.querySelector('img[src^="data:"], img[src^="blob:"]')
    };
  } finally {
    host.remove();
  }
}

function copyWithEvent(doc, { html, text }) {
  // The copy event writes both formats without changing the user's selection.
  let written = false;
  const onCopy = (event) => {
    if (!event.clipboardData) return;
    event.clipboardData.setData('text/html', html);
    event.clipboardData.setData('text/plain', text);
    event.preventDefault();
    written = true;
  };
  doc.addEventListener('copy', onCopy);
  try {
    return doc.execCommand('copy') && written;
  } finally {
    doc.removeEventListener('copy', onCopy);
  }
}

export async function copyWechatArticle(source) {
  const payload = buildWechatArticle(source);
  try {
    if (!navigator.clipboard?.write || !globalThis.ClipboardItem) throw new Error('clipboard-unavailable');
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([payload.html], { type: 'text/html' }),
      'text/plain': new Blob([payload.text], { type: 'text/plain' })
    })]);
  } catch {
    if (!copyWithEvent(source.ownerDocument, payload)) throw new Error('无法复制富文本，请允许浏览器访问剪贴板后重试');
  }
  return { hasLocalImages: payload.hasLocalImages };
}
