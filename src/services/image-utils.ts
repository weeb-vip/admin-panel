export function getCdnUrl(): string {
  return 'https://cdn.weeb.vip';
}

export function getSafeImageUrl(src: string, path?: string): string {
  const cdnUrl = getCdnUrl();
  console.log("src", src, path);
  // Replace %20 with + to match React SafeImage behavior exactly
  const encodedSrc = src.toLowerCase().replace(/%20/g, "+");
  // Path handling - add trailing slash if path exists
  const pathPrefix = path ? `${path}/` : "";

  // Return the properly encoded URL - only single encodeURIComponent like React
  return `${cdnUrl}/${pathPrefix}${encodeURIComponent(escapeUri(encodedSrc))}`;
}

function escapeUri(str: string): string {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, char =>
      '%' + char.charCodeAt(0).toString(16).toUpperCase()
    );
}
