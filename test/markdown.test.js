import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/lib/markdown.js';
import { WEMD_THEMES } from '../src/themes/catalog.js';
import { normalizeProject, parseProject, serializeProject } from '../src/model/project.js';
import { readFileSync } from 'node:fs';

test('all 17 WeMD themes have styles and persist without falling back', () => {
  assert.equal(WEMD_THEMES.length, 17);
  assert.equal(new Set(WEMD_THEMES.map((theme) => theme.id)).size, 17);
  for (const { id } of WEMD_THEMES) {
    assert.equal(parseProject(serializeProject(normalizeProject({ typography: id }))).typography, id);
    const css = readFileSync(new URL(`../src/themes/wemd/${id.slice(5)}.css`, import.meta.url), 'utf8');
    assert.ok(css.includes(`.markdown-body.typography-${id}`));
    assert.ok(!css.includes('#wemd'));
  }
});

test('WeMD adapter renders heading structure, lists, quotes and highlighted code', () => {
  const html = renderMarkdown('# A **title**\n\n> Quote\n\n- Item\n\n```js\nconst n = 1;\n```', 'wemd-default');
  assert.match(html, /class="prefix"/);
  assert.match(html, /class="content">A <strong>title/);
  assert.match(html, /class="multiquote-1"/);
  assert.match(html, /<li><section>/);
  assert.match(html, /hljs-keyword/);
  assert.match(renderMarkdown('```unknown\n<script>alert(1)</script>\n```', 'wemd-default'), /&lt;script&gt;/);
  assert.doesNotMatch(renderMarkdown('# Title', 'classic'), /class="content"/);
});
