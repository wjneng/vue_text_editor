const blockTags = [
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li', 'figure', 'figcaption',
  'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
];
const inlineTags = ['strong', 'em', 'u', 's', 'code', 'br', 'img', 'video', 'a'];
const allowedTags = [...blockTags, ...inlineTags];

export function sanitizeEditorHtml(value = '') {
  let html = String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<(\/?)b(\s[^>]*)?>/gi, '<$1strong>')
    .replace(/<(\/?)i(\s[^>]*)?>/gi, '<$1em>')
    .replace(/<div(\s[^>]*)?>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    .replace(/<br\s*\/?>/gi, '<br>')
    .replace(/<\/br>/gi, '');

  html = html.replace(/<([a-z][a-z0-9-]*)([^>]*)>/gi, (match, tag, attrs) => {
    const tagName = tag.toLowerCase();
    if (!allowedTags.includes(tagName)) {
      return '';
    }

    if (tagName === 'img') {
      const src = decodeEntities(readAttribute(attrs, 'src'));
      if (!src) {
        return '';
      }
      const alt = escapeAttribute(decodeEntities(readAttribute(attrs, 'alt') || '图片'));
      return `<img src="${escapeAttribute(src)}" alt="${alt}">`;
    }

    if (tagName === 'video') {
      const src = decodeEntities(readAttribute(attrs, 'src'));
      if (!src) {
        return '';
      }
      return `<video src="${escapeAttribute(src)}" controls>`;
    }

    if (tagName === 'a') {
      const href = decodeEntities(readAttribute(attrs, 'href'));
      if (!href) {
        return '';
      }
      return `<a href="${escapeAttribute(href)}">`;
    }

    if (tagName === 'hr') {
      return '<hr>';
    }

    return `<${tagName}>`;
  });

  html = html.replace(/<\/([a-z][a-z0-9-]*)>/gi, (match, tag) => {
    const tagName = tag.toLowerCase();
    return allowedTags.includes(tagName) && tagName !== 'img' && tagName !== 'br' && tagName !== 'hr'
      ? `</${tagName}>`
      : '';
  });

  return html.trim();
}

export function taggedTextToEditorHtml(value = '') {
  const text = extractBodyHtml(String(value || '').trim());
  if (!/<(h[1-6]|p|blockquote|pre|ul|ol|li|strong|em|u|s|code|img|video|a|hr|table|thead|tbody|tr|th|td)\b[\s\S]*>/i.test(text)) {
    return null;
  }

  return sanitizeEditorHtml(text);
}

export function markdownToEditorHtml(value = '') {
  const lines = String(value || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let orderedListItems = [];
  let quoteLines = [];
  let codeLines = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }
    blocks.push(`<p>${parseMarkdownInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) {
      return;
    }
    blocks.push(`<ul>${listItems.map((item) => `<li>${parseMarkdownInline(item)}</li>`).join('')}</ul>`);
    listItems = [];
  };

  const flushOrderedList = () => {
    if (!orderedListItems.length) {
      return;
    }
    blocks.push(`<ol>${orderedListItems.map((item) => `<li>${parseMarkdownInline(item)}</li>`).join('')}</ol>`);
    orderedListItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) {
      return;
    }
    blocks.push(`<blockquote>${quoteLines.map((item) => parseMarkdownInline(item)).join('<br>')}</blockquote>`);
    quoteLines = [];
  };

  const flushCode = () => {
    blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n').trim())}</code></pre>`);
    codeLines = [];
  };

  let lineIndex = 0;
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (/^```/.test(line.trim())) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushList();
        flushOrderedList();
        flushQuote();
        inCodeBlock = true;
      }
      lineIndex += 1;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      lineIndex += 1;
      continue;
    }

    const trimmed = line.trim();
    const table = readMarkdownTable(lines, lineIndex);
    if (table) {
      flushParagraph();
      flushList();
      flushOrderedList();
      flushQuote();
      blocks.push(table.html);
      lineIndex += table.linesUsed;
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushOrderedList();
      flushQuote();
      lineIndex += 1;
      continue;
    }

    const horizontalRule = trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/);
    if (horizontalRule) {
      flushParagraph();
      flushList();
      flushOrderedList();
      flushQuote();
      blocks.push('<hr>');
      lineIndex += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      flushOrderedList();
      flushQuote();
      blocks.push(`<h${heading[1].length}>${parseMarkdownInline(heading[2])}</h${heading[1].length}>`);
      lineIndex += 1;
      continue;
    }

    const quote = trimmed.match(/^>\s?(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      flushOrderedList();
      quoteLines.push(quote[1]);
      lineIndex += 1;
      continue;
    }

    const unorderedItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedItem) {
      flushParagraph();
      flushOrderedList();
      flushQuote();
      listItems.push(unorderedItem[1]);
      lineIndex += 1;
      continue;
    }

    const orderedItem = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      flushList();
      flushQuote();
      orderedListItems.push(orderedItem[1]);
      lineIndex += 1;
      continue;
    }

    paragraph.push(trimmed);
    lineIndex += 1;
  }

  if (inCodeBlock) {
    flushCode();
  }
  flushParagraph();
  flushList();
  flushOrderedList();
  flushQuote();

  return sanitizeEditorHtml(blocks.join('') || '<p><br></p>');
}

function extractBodyHtml(value) {
  const bodyMatch = value.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }

  return value;
}

function readMarkdownTable(lines, startIndex) {
  const headerLine = lines[startIndex]?.trim();
  const separatorLine = lines[startIndex + 1]?.trim();
  if (!isMarkdownTableRow(headerLine) || !isMarkdownTableSeparator(separatorLine)) {
    return null;
  }

  const headers = splitMarkdownTableRow(headerLine);
  const rows = [];
  let index = startIndex + 2;
  while (isMarkdownTableRow(lines[index]?.trim())) {
    rows.push(splitMarkdownTableRow(lines[index].trim()));
    index += 1;
  }

  const headHtml = `<thead><tr>${headers.map((cell) => `<th>${parseMarkdownInline(cell)}</th>`).join('')}</tr></thead>`;
  const bodyHtml = rows.length
    ? `<tbody>${rows.map((row) => `<tr>${headers.map((header, cellIndex) => `<td>${parseMarkdownInline(row[cellIndex] || '')}</td>`).join('')}</tr>`).join('')}</tbody>`
    : '<tbody></tbody>';

  return {
    html: `<table>${headHtml}${bodyHtml}</table>`,
    linesUsed: Math.max(2, index - startIndex)
  };
}

function isMarkdownTableRow(value = '') {
  return /^\|.+\|$/.test(value);
}

function isMarkdownTableSeparator(value = '') {
  if (!isMarkdownTableRow(value)) {
    return false;
  }
  return splitMarkdownTableRow(value).every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitMarkdownTableRow(value = '') {
  return value
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

export function editorHtmlToMarkdown(value = '') {
  let markdown = sanitizeEditorHtml(value);

  markdown = markdown
    .replace(/<figure>\s*/gi, '')
    .replace(/\s*<\/figure>/gi, '')
    .replace(/<figcaption>[\s\S]*?<\/figcaption>/gi, '')
    .replace(/<img\b([^>]*)>/gi, (match, attrs) => {
      const src = readAttribute(attrs, 'src');
      const alt = readAttribute(attrs, 'alt') || '图片';
      return src ? `![${alt}](${src})` : '';
    })
    .replace(/<video\b([^>]*)>(?:[\s\S]*?<\/video>)?/gi, (match, attrs) => {
      const src = readAttribute(attrs, 'src');
      return src ? `<video src="${src}" controls></video>\n\n` : '';
    })
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (match, attrs, content) => {
      const href = readAttribute(attrs, 'href');
      const text = stripTags(content).trim();
      return href && text ? `[${text}](${href})` : text;
    })
    .replace(/<hr>/gi, '---\n\n')
    .replace(/<table>([\s\S]*?)<\/table>/gi, (match, content) => tableToMarkdown(content))
    .replace(/<h1>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4>([\s\S]*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5>([\s\S]*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6>([\s\S]*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      const text = stripTags(content).trim();
      return text ? `> ${text}\n\n` : '';
    })
    .replace(/<pre>(?!<code>)([\s\S]*?)<\/pre>/gi, (match, content) => {
      return `\`\`\`\n${decodeEntities(stripTags(content)).trim()}\n\`\`\`\n\n`;
    })
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (match, content) => {
      return `\`\`\`\n${decodeEntities(stripTags(content)).trim()}\n\`\`\`\n\n`;
    })
    .replace(/<ul>([\s\S]*?)<\/ul>/gi, (match, content) => listToMarkdown(content, '-'))
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, (match, content) => listToMarkdown(content, '1.'))
    .replace(/<p>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<s>([\s\S]*?)<\/s>/gi, '~~$1~~')
    .replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<u>([\s\S]*?)<\/u>/gi, '<u>$1</u>')
    .replace(/<br>/gi, '\n');

  return decodeEntities(stripUnknownTags(markdown))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function wrapHtmlDocument(content) {
  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>导出的文档</title>',
    '</head>',
    `<body style="${documentStyles.body}">`,
    `  <main style="${documentStyles.main}">`,
    inlineDocumentStyles(sanitizeEditorHtml(content)),
    '  </main>',
    '</body>',
    '</html>'
  ].join('\n');
}

const documentStyles = {
  body: 'box-sizing:border-box;margin:0;padding:32px 18px;color:#1e2923;background:#f6f7f4;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:17px;line-height:1.7;',
  main: 'box-sizing:border-box;max-width:860px;margin:0 auto;padding:34px;border:1px solid #d7ded5;border-radius:8px;background:#ffffff;',
  h1: 'margin:0 0 14px;color:#172026;font-size:34px;line-height:1.2;',
  h2: 'margin:0 0 14px;color:#172026;font-size:26px;line-height:1.2;',
  h3: 'margin:0 0 14px;color:#172026;font-size:21px;line-height:1.2;',
  h4: 'margin:0 0 12px;color:#172026;font-size:18px;line-height:1.25;',
  h5: 'margin:0 0 10px;color:#172026;font-size:16px;line-height:1.3;',
  h6: 'margin:0 0 10px;color:#3b4740;font-size:14px;line-height:1.35;',
  p: 'margin:0 0 16px;font-size:17px;line-height:1.7;',
  blockquote: 'margin:0 0 16px;border-left:4px solid #245a48;padding:9px 0 9px 14px;color:#455249;background:#f3f7f2;font-size:17px;line-height:1.7;',
  ul: 'margin:0 0 16px;font-size:17px;line-height:1.7;',
  ol: 'margin:0 0 16px;font-size:17px;line-height:1.7;',
  hr: 'height:1px;margin:22px 0;border:0;background:#d7ded5;',
  table: 'width:100%;margin:0 0 16px;border-collapse:collapse;font-size:15px;line-height:1.5;',
  th: 'border:1px solid #cfd8ce;padding:8px 10px;background:#f3f7f2;text-align:left;font-weight:700;',
  td: 'border:1px solid #cfd8ce;padding:8px 10px;text-align:left;',
  figure: 'margin:0 0 16px;font-size:17px;line-height:1.7;',
  pre: 'box-sizing:border-box;overflow:auto;margin:0 0 16px;border-radius:8px;padding:14px;color:#eaf1ec;background:#101713;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:13px;',
  code: 'border-radius:5px;padding:2px 5px;color:#154834;background:#e8f1ea;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:0.9em;',
  preCode: 'padding:0;color:inherit;background:transparent;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:13px;',
  img: 'display:inline-block;max-width:100%;max-height:420px;margin:0;vertical-align:middle;border-radius:8px;'
  ,
  video: 'display:block;max-width:100%;max-height:480px;margin:0 0 16px;border-radius:8px;background:#000000;'
};

function inlineDocumentStyles(content) {
  return content
    .replace(/<h1>/gi, `<h1 style="${documentStyles.h1}">`)
    .replace(/<h2>/gi, `<h2 style="${documentStyles.h2}">`)
    .replace(/<h3>/gi, `<h3 style="${documentStyles.h3}">`)
    .replace(/<h4>/gi, `<h4 style="${documentStyles.h4}">`)
    .replace(/<h5>/gi, `<h5 style="${documentStyles.h5}">`)
    .replace(/<h6>/gi, `<h6 style="${documentStyles.h6}">`)
    .replace(/<p>/gi, `<p style="${documentStyles.p}">`)
    .replace(/<blockquote>/gi, `<blockquote style="${documentStyles.blockquote}">`)
    .replace(/<ul>/gi, `<ul style="${documentStyles.ul}">`)
    .replace(/<ol>/gi, `<ol style="${documentStyles.ol}">`)
    .replace(/<hr>/gi, `<hr style="${documentStyles.hr}">`)
    .replace(/<table>/gi, `<table style="${documentStyles.table}">`)
    .replace(/<th>/gi, `<th style="${documentStyles.th}">`)
    .replace(/<td>/gi, `<td style="${documentStyles.td}">`)
    .replace(/<figure>/gi, `<figure style="${documentStyles.figure}">`)
    .replace(/<pre><code>/gi, `<pre style="${documentStyles.pre}"><code style="${documentStyles.preCode}">`)
    .replace(/<pre>/gi, `<pre style="${documentStyles.pre}">`)
    .replace(/<code>/gi, `<code style="${documentStyles.code}">`)
    .replace(/<img\b([^>]*)>/gi, `<img$1 style="${documentStyles.img}">`)
    .replace(/<video\b([^>]*)>/gi, `<video$1 style="${documentStyles.video}">`);
}

function listToMarkdown(content, marker) {
  const items = [...content.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((item) => stripTags(item[1]).trim())
    .filter(Boolean);

  return items.length ? `${items.map((item) => `${marker} ${item}`).join('\n')}\n\n` : '';
}

function tableToMarkdown(content) {
  const headers = [...content.matchAll(/<th>([\s\S]*?)<\/th>/gi)]
    .map((cell) => stripTags(cell[1]).trim());
  const bodyRows = [...content.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]
    .map((row) => [...row[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)].map((cell) => stripTags(cell[1]).trim()))
    .filter((row) => row.length);

  if (!headers.length && !bodyRows.length) {
    return '';
  }

  const columnCount = Math.max(headers.length, ...bodyRows.map((row) => row.length));
  const normalizedHeaders = Array.from({ length: columnCount }, (_, index) => headers[index] || '');
  const separator = Array.from({ length: columnCount }, () => '---');
  const rows = bodyRows.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] || ''));

  return [
    markdownTableRow(normalizedHeaders),
    markdownTableRow(separator),
    ...rows.map(markdownTableRow),
    ''
  ].join('\n');
}

function markdownTableRow(cells) {
  return `| ${cells.join(' | ')} |`;
}

function stripTags(value) {
  return String(value).replace(/<\/?[^>]+>/g, '');
}

function stripUnknownTags(value) {
  return String(value).replace(/<\/?(p|h1|h2|h3|h4|h5|h6|blockquote|pre|ul|ol|li|figure|figcaption|hr|table|thead|tbody|tr|th|td)>/gi, '');
}

function parseMarkdownInline(value) {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']+["'])?\)/g, (match, alt, src) => (
      `<img src="${escapeAttribute(decodeEntities(src.trim()))}" alt="${escapeAttribute(decodeEntities(alt.trim() || '图片'))}">`
    ))
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']+["'])?\)/g, (match, label, href) => (
      `<a href="${escapeAttribute(decodeEntities(href.trim()))}">${label}</a>`
    ))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function readAttribute(attributes, name) {
  const pattern = new RegExp(`${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = String(attributes || '').match(pattern);
  return match?.[1] || match?.[2] || match?.[3] || '';
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function decodeEntities(value) {
  return String(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
