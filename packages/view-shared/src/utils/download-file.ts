export function downloadCSV<
  T extends Record<string, string | number | boolean | undefined | null>,
>(
  list: T[],
  {
    filename,
    withTimeSuffix = true,
  }: { filename: string; withTimeSuffix?: boolean },
) {
  // Convert list to CSV
  const headers = Object.keys(list[0]) as (keyof (typeof list)[number])[];
  const csvContent = [
    headers.join(','),
    ...list.map(row => headers.map(header => row[header] ?? '').join(',')),
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
