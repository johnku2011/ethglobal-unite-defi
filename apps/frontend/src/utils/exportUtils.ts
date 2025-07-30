/**
 * 數據導出工具函數
 */

export interface CSVExportOptions {
  headers: string[]; // CSV表頭
  data: any[][]; // CSV數據（行列二維陣列）
  filename: string; // 導出文件名（不含後綴）
}

/**
 * 導出數據為CSV文件
 * @param options 導出選項
 */
export function exportToCSV(options: CSVExportOptions): void {
  const { headers, data, filename } = options;

  // 創建CSV內容
  const csvContent = [
    headers.join(','),
    ...data.map((row) => row.map(formatCSVCell).join(',')),
  ].join('\n');

  // 創建並下載文件
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 格式化CSV單元格值
 * @param value 單元格值
 * @returns 格式化後的字符串
 */
function formatCSVCell(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // 如果包含逗號、雙引號或換行符，則需要用雙引號括起來
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    // 替換所有雙引號為兩個雙引號
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * 導出數據為JSON文件
 * @param data 要導出的數據
 * @param filename 文件名（不含後綴）
 */
export function exportToJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
