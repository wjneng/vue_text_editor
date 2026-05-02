const resetOnEnterTags = new Set(['blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export function shouldResetBlockOnEnter(tagName = '') {
  return resetOnEnterTags.has(String(tagName).toLowerCase());
}

export function isClickBelowLastLine(editorRect, lastChildRect, clientY) {
  if (!editorRect || !lastChildRect) {
    return false;
  }

  return clientY > lastChildRect.bottom && clientY <= editorRect.bottom;
}
