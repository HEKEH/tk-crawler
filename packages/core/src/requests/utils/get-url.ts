import qs from 'qs';

export function getUrl({
  baseUrl,
  path,
  params,
}: {
  baseUrl: string;
  path: string;
  params: Record<string, string | number | undefined>;
}) {
  const queryString = qs.stringify(params);
  return `${baseUrl}${path}?${queryString}`;
}
