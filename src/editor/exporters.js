import { inlineHtmlToMarkdown, sanitizeInlineHtml, textToInlineHtml } from './inlineStyles';

const headingDepth = {
  1: '#',
  2: '##',
  3: '###',
  4: '####',
  5: '#####',
  6: '######'
};

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function blocksToHtml(blocks = []) {
  return blocks
    .map((block) => blockToHtml(block))
    .filter(Boolean)
    .join('\n');
}

export function blocksToMarkdown(blocks = []) {
  return blocks
    .map((block) => blockToMarkdown(block))
    .filter(Boolean)
    .join('\n\n');
}

function blockToHtml(block) {
  if (!block || !block.type) {
    return '';
  }

  if (block.type === 'heading') {
    const level = clampHeadingLevel(block.level);
    return `<h${level}>${blockInlineHtml(block)}</h${level}>`;
  }

  if (block.type === 'paragraph') {
    return `<p>${blockInlineHtml(block)}</p>`;
  }

  if (block.type === 'quote') {
    return `<blockquote>${blockInlineHtml(block)}</blockquote>`;
  }

  if (block.type === 'list') {
    const items = normaliseListItems(block.items);
    if (!items.length) {
      return '';
    }

    return [
      '<ul>',
      ...items.map((item) => `  <li>${sanitizeInlineHtml(item)}</li>`),
      '</ul>'
    ].join('\n');
  }

  if (block.type === 'image') {
    if (!block.src) {
      return '';
    }

    const alt = escapeHtml(block.alt || '图片');
    const caption = block.alt ? `<figcaption>${alt}</figcaption>` : '';
    return `<figure><img src="${escapeHtml(block.src)}" alt="${alt}">${caption}</figure>`;
  }

  return '';
}

function blockToMarkdown(block) {
  if (!block || !block.type) {
    return '';
  }

  if (block.type === 'heading') {
    const depth = headingDepth[clampHeadingLevel(block.level)] || '##';
    return `${depth} ${blockMarkdown(block)}`.trim();
  }

  if (block.type === 'paragraph') {
    return blockMarkdown(block);
  }

  if (block.type === 'quote') {
    return `> ${blockMarkdown(block)}`.trimEnd();
  }

  if (block.type === 'list') {
    return normaliseListItems(block.items)
      .map((item) => `- ${inlineHtmlToMarkdown(item)}`)
      .join('\n');
  }

  if (block.type === 'image') {
    if (!block.src) {
      return '';
    }

    return `![${block.alt || '图片'}](${block.src})`;
  }

  return '';
}

function clampHeadingLevel(level) {
  const numericLevel = Number(level);
  if (numericLevel >= 1 && numericLevel <= 6) {
    return numericLevel;
  }

  return 2;
}

function normaliseListItems(items = []) {
  return items.map((item) => String(item).trim()).filter(Boolean);
}

function blockInlineHtml(block) {
  return block.html ? sanitizeInlineHtml(block.html) : textToInlineHtml(block.text || '');
}

function blockMarkdown(block) {
  return block.html ? inlineHtmlToMarkdown(block.html) : block.text || '';
}
