const DRIVE_FILE_ID_REGEX = /^[A-Za-z0-9_-]{10,}$/;

/**
 * Builds a Google Drive public file URL (UC endpoint) from a file id.
 *
 * @param fileId Google Drive file id.
 * @param v Optional cache-busting version token.
 * @returns Public original file URL that can be used as an image src.
 */
export function publicDriveFileUrl(fileId: string, v?: string) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}${
    v ? `&v=${encodeURIComponent(v)}` : ''
  }`;
}

/**
 * Checks whether a string is an absolute HTTP(S) URL.
 *
 * @param value Input string to validate.
 * @returns True when value is a valid http:// or https:// URL.
 */
export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Heuristic check for Google Drive file id shape.
 *
 * @param value Candidate id string.
 * @returns True when value matches expected Drive id pattern.
 */
export function isDriveFileId(value: string) {
  return DRIVE_FILE_ID_REGEX.test(value);
}

/**
 * Resolves a raw image source into a renderable URL.
 *
 * Resolution order:
 * 1) Keep as-is when already an absolute HTTP(S) URL.
 * 2) Convert Drive file id to Drive UC endpoint URL.
 * 3) Fallback to original source.
 *
 * @param source Raw source value (URL or Drive file id).
 * @param v Optional cache-busting version token.
 * @returns Resolved image src string.
 */
export function resolveDriveImageSource(source: string, v?: string) {
  if (!source) return source;
  if (isHttpUrl(source)) return source;
  if (isDriveFileId(source)) return publicDriveFileUrl(source, v);
  return source;
}
