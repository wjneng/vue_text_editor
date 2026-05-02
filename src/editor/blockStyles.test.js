import { describe, expect, it } from 'vitest';
import { convertBlockStyle } from './blockStyles';

describe('block style conversion', () => {
  it('converts paragraph text to heading without losing content', () => {
    expect(
      convertBlockStyle({ id: '1', type: 'paragraph', text: '项目说明' }, 'heading', 1)
    ).toEqual({ id: '1', type: 'heading', level: 1, text: '项目说明', html: '项目说明' });
  });

  it('converts list items to paragraph text', () => {
    expect(
      convertBlockStyle({ id: '2', type: 'list', items: ['第一项', '第二项'] }, 'paragraph')
    ).toEqual({ id: '2', type: 'paragraph', text: '第一项\n第二项', html: '第一项\n第二项' });
  });

  it('converts text to a list with split lines', () => {
    expect(
      convertBlockStyle({ id: '3', type: 'quote', text: '第一行\n第二行' }, 'list')
    ).toEqual({ id: '3', type: 'list', items: ['第一行', '第二行'] });
  });

  it('keeps image source when reapplying image style', () => {
    expect(
      convertBlockStyle({ id: '4', type: 'image', src: 'data:image/png;base64,abc', alt: '封面' }, 'image')
    ).toEqual({ id: '4', type: 'image', src: 'data:image/png;base64,abc', alt: '封面' });
  });
});
