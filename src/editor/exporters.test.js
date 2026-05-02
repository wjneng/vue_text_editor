import { describe, expect, it } from 'vitest';
import { blocksToHtml, blocksToMarkdown, escapeHtml } from './exporters';

describe('editor exporters', () => {
  const blocks = [
    { type: 'heading', level: 2, text: '项目计划' },
    { type: 'paragraph', text: '支持 <文本> 和图片。' },
    { type: 'quote', text: '保持内容清晰' },
    { type: 'list', items: ['编辑内容', '生成 HTML', '转成 Markdown'] },
    { type: 'image', src: 'data:image/png;base64,abc', alt: '示例图片' },
    { type: 'image', src: '', alt: '空图片' }
  ];

  it('escapes html special characters', () => {
    expect(escapeHtml('<script>"x"&</script>')).toBe(
      '&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;'
    );
  });

  it('converts content blocks to html', () => {
    expect(blocksToHtml(blocks)).toBe([
      '<h2>项目计划</h2>',
      '<p>支持 &lt;文本&gt; 和图片。</p>',
      '<blockquote>保持内容清晰</blockquote>',
      '<ul>',
      '  <li>编辑内容</li>',
      '  <li>生成 HTML</li>',
      '  <li>转成 Markdown</li>',
      '</ul>',
      '<figure><img src="data:image/png;base64,abc" alt="示例图片"><figcaption>示例图片</figcaption></figure>'
    ].join('\n'));
  });

  it('converts content blocks to markdown', () => {
    expect(blocksToMarkdown(blocks)).toBe([
      '## 项目计划',
      '',
      '支持 <文本> 和图片。',
      '',
      '> 保持内容清晰',
      '',
      '- 编辑内容',
      '- 生成 HTML',
      '- 转成 Markdown',
      '',
      '![示例图片](data:image/png;base64,abc)'
    ].join('\n'));
  });

  it('keeps inline styles in html and markdown output', () => {
    const styledBlocks = [
      {
        type: 'paragraph',
        html: '普通 <strong>加粗</strong> <em>斜体</em> <u>下划线</u> <code>code</code>'
      }
    ];

    expect(blocksToHtml(styledBlocks)).toBe(
      '<p>普通 <strong>加粗</strong> <em>斜体</em> <u>下划线</u> <code>code</code></p>'
    );
    expect(blocksToMarkdown(styledBlocks)).toBe('普通 **加粗** *斜体* <u>下划线</u> `code`');
  });
});
