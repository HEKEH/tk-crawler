import type { ColInfo, WorkBook, WorkSheet } from 'xlsx';
import { utils, write } from 'xlsx';

function getFullFileNameWithTimeSuffix(filename: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${filename}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSV<
  T extends Record<string, string | number | boolean | undefined | null>,
>(
  list: T[],
  options: {
    filename: string;
    withTimeSuffix?: boolean;
    columns?: {
      key: keyof T;
      label: string;
    }[];
    suffix?: string;
  },
) {
  const { filename, withTimeSuffix = true, suffix = 'csv' } = options;
  const columns =
    options.columns ||
    (Object.keys(list[0]) as (keyof T)[]).map(key => ({
      key,
      label: key,
    }));
  // Convert list to CSV
  const headers = columns.map(column => column.label);
  const keys = columns.map(column => column.key);
  const csvContent = [
    headers.join(','),
    ...list.map(row => keys.map(key => row[key] ?? '').join(',')),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  let _filename = filename;
  if (withTimeSuffix) {
    _filename = getFullFileNameWithTimeSuffix(filename);
  }
  downloadBlob(blob, `${_filename}.${suffix}`);
}

interface XlsxColumnConfig<T> {
  key: keyof T;
  label: string;
  width?: number;
}

interface DownloadXLSXOptions<T> {
  filename: string;
  withTimeSuffix?: boolean;
  columns?: XlsxColumnConfig<T>[];
  onProgress?: (progress: number) => void;
}

export async function downloadXLSX<
  T extends Record<string, string | number | boolean | undefined | null>,
>(list: T[], options: DownloadXLSXOptions<T>): Promise<void> {
  try {
    const { filename, withTimeSuffix = true } = options;

    // Prepare columns with default styling
    const columns: XlsxColumnConfig<T>[] =
      options.columns ||
      (Object.keys(list[0]) as string[]).map(key => ({
        key,
        label: key,
        width: 15, // Default column width
      }));

    // Create workbook and worksheet
    const wb: WorkBook = utils.book_new();
    const ws: WorkSheet = utils.json_to_sheet(
      list.map(row => {
        const newRow: Record<string, string | number | boolean | null> = {};
        columns.forEach(col => {
          newRow[col.label] = row[col.key] ?? '';
        });
        return newRow;
      }),
    );

    // Apply column widths and styles
    const colWidths: ColInfo[] = columns.map(col => ({
      wch: col.width || 15,
      // style: col.style,
    }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    utils.book_append_sheet(wb, ws, 'Sheet1');

    // Generate filename with timestamp if needed
    let _filename = filename;
    if (withTimeSuffix) {
      _filename = getFullFileNameWithTimeSuffix(filename);
    }

    // Write file with progress tracking
    const wbout = write(wb, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    // Create blob and download
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, `${_filename}.xlsx`);
  } catch (error) {
    console.error('Error generating XLSX file:', error);
    throw new Error('Failed to generate XLSX file');
  }
}
