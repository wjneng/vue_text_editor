import { describe, expect, it } from 'vitest';
import {
  editorHtmlToMarkdown,
  markdownToEditorHtml,
  sanitizeEditorHtml,
  taggedTextToEditorHtml,
  wrapHtmlDocument
} from './richText';

describe('rich text helpers', () => {
  it('keeps supported rich text tags and removes unsafe attributes', () => {
    expect(
      sanitizeEditorHtml('<p onclick="x">文本 <b>加粗</b> <i>斜体</i> <script>x</script></p>')
    ).toBe('<p>文本 <strong>加粗</strong> <em>斜体</em> </p>');
  });

  it('converts rich text html to markdown', () => {
    expect(
      editorHtmlToMarkdown('<h2>标题</h2><p>文本 <strong>加粗</strong> <em>斜体</em></p><blockquote>引用</blockquote><pre><code>const a = 1;</code></pre>')
    ).toBe('## 标题\n\n文本 **加粗** *斜体*\n\n> 引用\n\n```\nconst a = 1;\n```');
  });

  it('preserves image position when converting to markdown', () => {
    expect(
      editorHtmlToMarkdown('<p>前文 <img src="data:image/png;base64,abc" alt="图"> 后文</p>')
    ).toBe('前文 ![图](data:image/png;base64,abc) 后文');
  });

  it('keeps linked images when converting to markdown', () => {
    expect(
      editorHtmlToMarkdown('<p><a href="https://example.com"><img src="https://example.com/a.png" alt="封面"></a></p>')
    ).toBe('[![封面](https://example.com/a.png)](https://example.com)');
  });

  it('does not double escape ampersands in image urls', () => {
    const url = 'https://gips0.baidu.com/it/u=1690853528,2506870245&fm=3028&app=3028&f=JPEG&fmt=auto?w=1024&h=1024';
    const escapedUrl = url.replaceAll('&', '&amp;');

    expect(sanitizeEditorHtml(`<img src="${escapedUrl}" alt="图片链接">`)).toBe(
      `<img src="${escapedUrl}" alt="图片链接">`
    );
  });

  it('keeps video tags and removes unsafe video attributes', () => {
    expect(
      sanitizeEditorHtml('<p>视频</p><video src="https://example.com/a.mp4" autoplay onclick="x"></video>')
    ).toBe('<p>视频</p><video src="https://example.com/a.mp4" controls></video>');
  });

  it('keeps video html when converting to markdown', () => {
    expect(
      editorHtmlToMarkdown('<p>前文</p><video src="https://example.com/a.mp4" controls></video><p>后文</p>')
    ).toBe('前文\n\n<video src="https://example.com/a.mp4" controls></video>\n\n后文');
  });

  it('turns typed html tags into editable rich html', () => {
    expect(taggedTextToEditorHtml('<h1>标题</h1><p>段落 <strong>重点</strong></p>')).toBe(
      '<h1>标题</h1><p>段落 <strong>重点</strong></p>'
    );
  });

  it('turns markdown source into editable rich html', () => {
    const markdown = [
      '# 标题',
      '',
      '正文 **加粗** *斜体* `代码`',
      '',
      '> 引用',
      '',
      '```',
      'const a = 1;',
      '```',
      '',
      '- 第一项',
      '- 第二项',
      '',
      '![封面](https://example.com/a.png)'
    ].join('\n');

    expect(markdownToEditorHtml(markdown)).toBe(
      '<h1>标题</h1><p>正文 <strong>加粗</strong> <em>斜体</em> <code>代码</code></p><blockquote>引用</blockquote><pre><code>const a = 1;</code></pre><ul><li>第一项</li><li>第二项</li></ul><p><img src="https://example.com/a.png" alt="封面"></p>'
    );
  });

  it('supports common markdown blocks and inline styles', () => {
    const markdown = [
      '## 二级标题',
      '',
      '这是 [链接](https://example.com) 和 ~~删除线~~。',
      '第二行',
      '',
      '> 第一行引用',
      '> 第二行引用',
      '',
      '1. 第一项',
      '2. 第二项',
      '',
      '---',
      '',
      '![图片](https://example.com/a.png "说明")'
    ].join('\n');

    expect(markdownToEditorHtml(markdown)).toBe(
      '<h2>二级标题</h2><p>这是 <a href="https://example.com">链接</a> 和 <s>删除线</s>。 第二行</p><blockquote>第一行引用<br>第二行引用</blockquote><ol><li>第一项</li><li>第二项</li></ol><hr><p><img src="https://example.com/a.png" alt="图片"></p>'
    );
  });

  it('supports h4 to h6 markdown headings', () => {
    const markdown = [
      '#### 四级标题',
      '##### 五级标题',
      '###### 六级标题'
    ].join('\n');

    const html = '<h4>四级标题</h4><h5>五级标题</h5><h6>六级标题</h6>';

    expect(markdownToEditorHtml(markdown)).toBe(html);
    expect(editorHtmlToMarkdown(html)).toBe('#### 四级标题\n\n##### 五级标题\n\n###### 六级标题');
  });

  it('supports markdown tables', () => {
    const markdown = [
      '| 姓名 | 分数 |',
      '| --- | ---: |',
      '| 小明 | 95 |',
      '| 小红 | 88 |'
    ].join('\n');

    const html = '<table><thead><tr><th>姓名</th><th>分数</th></tr></thead><tbody><tr><td>小明</td><td>95</td></tr><tr><td>小红</td><td>88</td></tr></tbody></table>';

    expect(markdownToEditorHtml(markdown)).toBe(html);
    expect(editorHtmlToMarkdown(html)).toBe('| 姓名 | 分数 |\n| --- | --- |\n| 小明 | 95 |\n| 小红 | 88 |');
  });

  it('imports a full html document by keeping only body content', () => {
    expect(
      taggedTextToEditorHtml(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>导出的文档</title>
</head>
<body>
<h1>标题</h1><p>正文 <strong>加粗</strong></p>
</body>
</html>`)
    ).toBe('<h1>标题</h1><p>正文 <strong>加粗</strong></p>');
  });

  it('exports a standalone html document with tag inline styles', () => {
    const document = wrapHtmlDocument('<h1>标题</h1><p>正文</p><blockquote>引用</blockquote><pre>code</pre><video src="https://example.com/a.mp4" controls></video>');

    expect(document).not.toContain('<style>');
    expect(document).not.toContain('<link');
    expect(document).not.toContain('rel="stylesheet"');
    expect(document).toContain('<body style=');
    expect(document).toContain('<main style=');
    expect(document).toContain('<h1 style=');
    expect(document).toContain('<p style=');
    expect(document).toContain('font-size:17px');
    expect(document).toContain('<blockquote style=');
    expect(document).toContain('<pre style=');
    expect(document).toContain('<video src="https://example.com/a.mp4" controls style=');
  });
});
