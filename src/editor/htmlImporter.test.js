import { describe, expect, it } from 'vitest';
import { parseTaggedContent } from './htmlImporter';

describe('html importer', () => {
  it('returns null when content has no html tags', () => {
    expect(parseTaggedContent('普通文本')).toBeNull();
  });

  it('converts supported html tags to editor blocks', () => {
    expect(
      parseTaggedContent(
        '<h1>主标题</h1><p>这是一段 <strong>重点</strong> 文本。</p><blockquote>引用</blockquote><ul><li>第一项</li><li>第二项</li></ul>',
        () => 'id'
      )
    ).toEqual([
      { id: 'id', type: 'heading', level: 1, text: '主标题', html: '主标题' },
      { id: 'id', type: 'paragraph', text: '这是一段 重点 文本。', html: '这是一段 <strong>重点</strong> 文本。' },
      { id: 'id', type: 'quote', text: '引用', html: '引用' },
      { id: 'id', type: 'list', items: ['第一项', '第二项'] }
    ]);
  });

  it('keeps image style and removes the image tag text', () => {
    expect(
      parseTaggedContent('<img src="data:image/png;base64,abc" alt="封面图">', () => 'img-id')
    ).toEqual([
      {
        id: 'img-id',
        type: 'image',
        src: 'data:image/png;base64,abc',
        alt: '封面图'
      }
    ]);
  });

  it('turns unsupported wrappers into paragraphs with tags removed', () => {
    expect(parseTaggedContent('<section><em>说明</em>内容</section>', () => 'p-id')).toEqual([
      { id: 'p-id', type: 'paragraph', text: '说明内容', html: '<em>说明</em>内容' }
    ]);
  });
});
