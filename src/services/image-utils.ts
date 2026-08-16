export function getCdnUrl(): string {
  return 'https://cdn.weeb.vip';
}

/**
 * Build a CDN URL for an image key.
 *
 * `src` is a record id — anime, character, staff. Images used to be keyed by a
 * slug derived from the title, which meant lowercasing, underscoring and
 * escaping it here to match how the sync services stored it. Ids need none of
 * that.
 */
export function getSafeImageUrl(src: string, path?: string): string {
  const cdnUrl = getCdnUrl();
  const pathPrefix = path ? `${path}/` : "";
  return `${cdnUrl}/${pathPrefix}${encodeURIComponent(src)}`;
}
