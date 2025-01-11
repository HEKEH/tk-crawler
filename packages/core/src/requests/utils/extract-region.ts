export function extractRegionFromHtml(html: string): string | null {
  // Find the script tag content
  const pattern =
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/;
  const match = html.match(pattern);

  if (match && match[1]) {
    const jsonData = JSON.parse(match[1]);
    // Navigate to region in the nested structure
    const region =
      jsonData?.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo?.user
        ?.region;
    return region || null;
  }
  return null;
}
