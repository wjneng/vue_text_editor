import { inlineHtmlToText, sanitizeInlineHtml } from './inlineStyles';

const blockTagPattern = /<(h[1-6]|p|blockquote|ul|ol|img|section|article|div)(\s[^>]*)?>/i;

export function parseTaggedContent(content, createId = () => crypto.randomUUID()) {
  const source = String(content || '').trim();
  if (!/<[a-z][\s\S]*>/i.test(source)) {
    return null;
  }

  if (!blockTagPattern.test(source)) {
    return null;
  }

  const blocks = [];
  const pattern =
    /<(h[1-6]|p|blockquote|ul|ol|section|article|div)(\s[^>]*)?>([\s\S]*?)<\/\1>|<img\b([^>]*)>/gi;

  let match;
  while ((match = pattern.exec(source))) {
    if (match[1]) {
      const tag = match[1].toLowerCase();
      const inner = match[3] || '';
      const block = createTextBlock(tag, inner, createId);
      if (block) {
        blocks.push(block);
      }
      continue;
    }

    const image = createImageBlock(match[4] || '', createId);
    if (image) {
      blocks.push(image);
    }
  }

  return blocks.length ? blocks : null;
}

function createTextBlock(tag, innerHtml, createId) {
  if (tag === 'ul' || tag === 'ol') {
    const items = [...innerHtml.matchAll(/<li(\s[^>]*)?>([\s\S]*?)<\/li>/gi)]
      .map((item) => sanitizeInlineHtml(item[2]).trim())
      .filter((item) => inlineHtmlToText(item));

    return items.length ? { id: createId(), type: 'list', items } : null;
  }

  const html = sanitizeInlineHtml(innerHtml).trim();
  const text = inlineHtmlToText(html);
  if (!text) {
    return null;
  }

  if (tag.startsWith('h')) {
    return {
      id: createId(),
      type: 'heading',
      level: Number(tag.slice(1)),
      text,
      html
    };
  }

  if (tag === 'blockquote') {
    return { id: createId(), type: 'quote', text, html };
  }

  return { id: createId(), type: 'paragraph', text, html };
}

function createImageBlock(attributes, createId) {
  const src = readAttribute(attributes, 'src');
  if (!src) {
    return null;
  }

  return {
    id: createId(),
    type: 'image',
    src,
    alt: readAttribute(attributes, 'alt') || '图片'
  };
}

function readAttribute(attributes, name) {
  const pattern = new RegExp(`${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = attributes.match(pattern);
  return match?.[1] || match?.[2] || match?.[3] || '';
}
