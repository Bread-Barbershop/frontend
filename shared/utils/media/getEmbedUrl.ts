const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

const getYouTubeVideoId = (url: URL): string | null => {
  const host = url.hostname.toLowerCase();

  if (!YOUTUBE_HOSTS.has(host)) return null;

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  const idFromQuery = url.searchParams.get('v');
  if (idFromQuery && YOUTUBE_VIDEO_ID_PATTERN.test(idFromQuery)) {
    return idFromQuery;
  }

  const [prefix, id] = url.pathname.split('/').filter(Boolean);
  if (
    ['embed', 'shorts', 'live', 'v'].includes(prefix) &&
    id &&
    YOUTUBE_VIDEO_ID_PATTERN.test(id)
  ) {
    return id;
  }

  return null;
};

export const getEmbedUrl = (url: string | undefined): string | null => {
  if (!url || url.trim().length < 5) return null;

  const parsed = (() => {
    try {
      return new URL(url.trim());
    } catch {
      return null;
    }
  })();
  if (!parsed || parsed.protocol !== 'https:') return null;

  const id = getYouTubeVideoId(parsed);
  if (!id) return null;

  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0`;
};
