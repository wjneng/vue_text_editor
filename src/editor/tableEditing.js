const defaultHeaderText = '标题';
const defaultCellText = '内容';

export function getTableColumnCount(tableHtml = '') {
  const rows = String(tableHtml).match(/<tr>[\s\S]*?<\/tr>/gi) || [];
  return rows.reduce((max, row) => Math.max(max, countRowCells(row)), 0);
}

export function appendTableRowHtml(tableHtml = '') {
  const html = String(tableHtml);
  const columnCount = Math.max(1, getTableColumnCount(html));
  const rowHtml = `<tr>${Array.from({ length: columnCount }, () => `<td>${defaultCellText}</td>`).join('')}</tr>`;

  if (/<tbody>[\s\S]*?<\/tbody>/i.test(html)) {
    return html.replace(/<\/tbody>/i, `${rowHtml}</tbody>`);
  }

  return html.replace(/<\/table>/i, `<tbody>${rowHtml}</tbody></table>`);
}

export function appendTableColumnHtml(tableHtml = '') {
  return String(tableHtml).replace(/<tr>([\s\S]*?)<\/tr>/gi, (match, content) => {
    const isHeaderRow = /<th>[\s\S]*?<\/th>/i.test(content) && !/<td>[\s\S]*?<\/td>/i.test(content);
    const cellHtml = isHeaderRow
      ? `<th>${defaultHeaderText}</th>`
      : `<td>${defaultCellText}</td>`;

    return `<tr>${content}${cellHtml}</tr>`;
  });
}

function countRowCells(rowHtml = '') {
  return (String(rowHtml).match(/<(th|td)>[\s\S]*?<\/\1>/gi) || []).length;
}
