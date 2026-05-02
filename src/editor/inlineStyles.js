const allowedTags = ['strong', 'em', 'u', 's', 'code', 'br'];

export function sanitizeInlineHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<(\/?)b(\s[^>]*)?>/gi, '<$1strong>')
    .replace(/<(\/?)i(\s[^>]*)?>/gi, '<$1em>')
    .replace(/<(\/?)(strong|em|u|s|code)(\s[^>]*)?>/gi, '<$1$2>')
    .replace(/<br\s*\/?>/gi, '<br>')
    .replace(/<\/br>/gi, '')
    .replace(/<\/?([a-z][a-z0-9-]*)(\s[^>]*)?>/gi, (match, tag) => {
      return allowedTags.includes(tag.toLowerCase()) ? match.toLowerCase() : '';
    });
}

export function inlineHtmlToText(value = '') {
  return sanitizeInlineHtml(value)
    .replace(/<br>/gi, '\n')
    .replace(/<\/?(strong|em|u|s|code)>/gi, '')
    .replace(/\u00a0/g, ' ')
    .trim();
}

export function inlineHtmlToMarkdown(value = '') {
  let markdown = sanitizeInlineHtml(value);

  markdown = markdown
    .replace(/<br>/gi, '\n')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<s>([\s\S]*?)<\/s>/gi, '~~$1~~')
    .replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<u>([\s\S]*?)<\/u>/gi, '<u>$1</u>');

  return markdown
    .replace(/<\/?(strong|em|s|code)>/gi, '')
    .replace(/<br>/gi, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function textToInlineHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replace(/\n/g, '<br>');
}
