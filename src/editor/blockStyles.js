export function convertBlockStyle(block, targetType, headingLevel = 2) {
  const id = block.id;
  const text = extractText(block);
  const html = extractHtml(block);

  if (targetType === 'heading') {
    return { id, type: 'heading', level: headingLevel, text: text || '新的标题', html };
  }

  if (targetType === 'quote') {
    return { id, type: 'quote', text: text || '引用内容', html };
  }

  if (targetType === 'list') {
    return {
      id,
      type: 'list',
      items: splitListItems(text)
    };
  }

  if (targetType === 'image') {
    return {
      id,
      type: 'image',
      src: block.type === 'image' ? block.src : '',
      alt: block.type === 'image' ? block.alt || '图片说明' : text || '图片说明'
    };
  }

  return { id, type: 'paragraph', text: text || '新的段落内容', html };
}

function extractText(block) {
  if (!block) {
    return '';
  }

  if (block.type === 'list') {
    return (block.items || []).filter(Boolean).join('\n');
  }

  if (block.type === 'image') {
    return block.alt || '';
  }

  return block.text || '';
}

function splitListItems(text) {
  const items = String(text || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length ? items : ['列表项目'];
}

function extractHtml(block) {
  if (!block) {
    return '';
  }

  if (block.html) {
    return block.html;
  }

  return extractText(block);
}
