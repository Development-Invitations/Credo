import * as XLSX from 'xlsx';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * Экспортирует массив объектов в .xlsx с человеческими заголовками, автоподбором
 * ширины колонок и настоящими числовыми ячейками (не текстом) — чтобы Excel сразу
 * правильно выравнивал суммы и позволял их складывать.
 */
export function exportToExcel(rows: Record<string, any>[], columns: ExcelColumn[], sheetName: string, fileName: string) {
  const data = rows.map((row) => {
    const obj: Record<string, any> = {};
    for (const col of columns) obj[col.header] = row[col.key];
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data, { header: columns.map((c) => c.header) });

  ws['!cols'] = columns.map((col) => ({
    wch: col.width ?? Math.max(col.header.length + 2, 12),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
