import { describe, expect, it } from 'vitest';
import { isClickBelowLastLine, shouldResetBlockOnEnter } from './keyBehavior';

describe('editor key behavior', () => {
  it('resets styled block formats on Enter', () => {
    expect(shouldResetBlockOnEnter('blockquote')).toBe(true);
    expect(shouldResetBlockOnEnter('pre')).toBe(true);
    expect(shouldResetBlockOnEnter('h1')).toBe(true);
    expect(shouldResetBlockOnEnter('h2')).toBe(true);
    expect(shouldResetBlockOnEnter('h3')).toBe(true);
    expect(shouldResetBlockOnEnter('h4')).toBe(true);
    expect(shouldResetBlockOnEnter('h5')).toBe(true);
    expect(shouldResetBlockOnEnter('h6')).toBe(true);
  });

  it('keeps normal paragraph and list Enter behavior', () => {
    expect(shouldResetBlockOnEnter('p')).toBe(false);
    expect(shouldResetBlockOnEnter('li')).toBe(false);
    expect(shouldResetBlockOnEnter('ul')).toBe(false);
  });

  it('detects clicks below the last line inside editor', () => {
    const editorRect = { top: 0, bottom: 500 };
    const lastChildRect = { top: 80, bottom: 120 };

    expect(isClickBelowLastLine(editorRect, lastChildRect, 180)).toBe(true);
    expect(isClickBelowLastLine(editorRect, lastChildRect, 90)).toBe(false);
    expect(isClickBelowLastLine(editorRect, lastChildRect, 540)).toBe(false);
  });
});
