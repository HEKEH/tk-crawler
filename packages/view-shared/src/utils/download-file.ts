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
  },
) {
  const { filename, withTimeSuffix = true } = options;
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
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    _filename = `${filename}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  link.setAttribute('download', `${_filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
