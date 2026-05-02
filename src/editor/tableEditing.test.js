import { describe, expect, it } from 'vitest';
import {
  appendTableColumnHtml,
  appendTableRowHtml,
  getTableColumnCount
} from './tableEditing';

describe('table editing helpers', () => {
  it('appends a body row with the current table column count', () => {
    const html = '<table><thead><tr><th>姓名</th><th>分数</th></tr></thead><tbody><tr><td>小明</td><td>95</td></tr></tbody></table>';

    expect(appendTableRowHtml(html)).toBe(
      '<table><thead><tr><th>姓名</th><th>分数</th></tr></thead><tbody><tr><td>小明</td><td>95</td></tr><tr><td>内容</td><td>内容</td></tr></tbody></table>'
    );
  });

  it('creates tbody when appending a row to a header-only table', () => {
    const html = '<table><thead><tr><th>姓名</th><th>分数</th><th>备注</th></tr></thead></table>';

    expect(appendTableRowHtml(html)).toBe(
      '<table><thead><tr><th>姓名</th><th>分数</th><th>备注</th></tr></thead><tbody><tr><td>内容</td><td>内容</td><td>内容</td></tr></tbody></table>'
    );
  });

  it('appends one column to every table row', () => {
    const html = '<table><thead><tr><th>姓名</th><th>分数</th></tr></thead><tbody><tr><td>小明</td><td>95</td></tr><tr><td>小红</td><td>88</td></tr></tbody></table>';

    expect(appendTableColumnHtml(html)).toBe(
      '<table><thead><tr><th>姓名</th><th>分数</th><th>标题</th></tr></thead><tbody><tr><td>小明</td><td>95</td><td>内容</td></tr><tr><td>小红</td><td>88</td><td>内容</td></tr></tbody></table>'
    );
  });

  it('counts the widest row as table column count', () => {
    expect(getTableColumnCount('<table><tr><td>1</td></tr><tr><td>1</td><td>2</td></tr></table>')).toBe(2);
  });
});
