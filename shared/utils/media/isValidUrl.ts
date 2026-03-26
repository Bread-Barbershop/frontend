export const isValidUrl = (url: string | undefined): boolean => {
  if (!url || url.length < 5) return false;

  const parsed = (() => {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  })();
  if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) return false;

  return true;
};
