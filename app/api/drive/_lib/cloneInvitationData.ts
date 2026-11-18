import { isDriveFileId } from '@/shared/utils/media/driveImageUtils';
import {
  resolveShareDescription,
  resolveShareTitle,
} from '@/shared/utils/shareUrlDefaults';

import type { ShareUrlPayload } from './ensureInvitationMetaFile';

const RELATIVE_ORIGIN = 'https://invia.invalid';
const DRIVE_MEDIA_PATHS: Record<string, RegExp> = {
  'lh3.googleusercontent.com': /^\/d\/([^/=]+)/,
  'drive.google.com': /^\/(?:file\/d|drive\/folders)\/([^/]+)/,
  'www.googleapis.com': /^\/(?:upload\/)?drive\/v[23]\/files\/([^/]+)/,
  'content.googleapis.com': /^\/drive\/v[23]\/files\/([^/]+)/,
};
const DRIVE_QUERY_PATHS: Record<string, string[]> = {
  'drive.google.com': ['/uc', '/open', '/thumbnail'],
  'drive.usercontent.google.com': ['/download'],
};
const APP_ASSET_PATHS = ['/api/drive/previewAsset', '/api/drive/guestBgm'];

export function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asWebUrl(value: string) {
  if (!/^(https?:\/\/|\/)/i.test(value)) return null;
  try {
    return new URL(value, RELATIVE_ORIGIN);
  } catch {
    return null;
  }
}

function toOriginalUrlForm(value: string, url: URL) {
  if (value.startsWith('//')) return url.href.slice(url.protocol.length);
  if (value.startsWith('/')) return url.pathname + url.search + url.hash;
  return url.href;
}

function matchesGuestAudience(source: URL, candidate: URL) {
  const sourceAudience = source.searchParams.getAll('to');
  const candidateAudience = candidate.searchParams.getAll('to');
  if (sourceAudience.length === 0) return candidateAudience.length === 0;
  return (
    sourceAudience.length === 1 &&
    sourceAudience[0] !== '' &&
    candidateAudience.length === 1 &&
    sourceAudience[0] === candidateAudience[0]
  );
}

export function remapInvitationJson<T>(
  input: T,
  options: {
    ids: ReadonlyMap<string, string>;
    sourceLinks: ReadonlySet<string>;
    sourceDataId: string;
    guestUrl: string;
  }
): T {
  const { ids, sourceLinks, sourceDataId, guestUrl } = options;
  const sourceGuestUrls = Array.from(sourceLinks, link =>
    asWebUrl(link)
  ).filter((url): url is URL =>
    Boolean(url && /^\/(?:guest|i)\/[^/]+$/.test(url.pathname))
  );

  function remapString(value: string) {
    const direct = ids.get(value);
    if (direct) return direct;
    const url = asWebUrl(value);
    if (!url) return value;
    if (
      (url.pathname === `/guest/${sourceDataId}` &&
        !url.searchParams.has('to')) ||
      sourceGuestUrls.some(
        source =>
          source.pathname === url.pathname &&
          (source.origin === url.origin || url.origin === RELATIVE_ORIGIN) &&
          matchesGuestAudience(source, url)
      )
    ) {
      return guestUrl;
    }

    const pathMatch = DRIVE_MEDIA_PATHS[url.hostname]?.exec(url.pathname);
    const pathId = pathMatch?.[1];
    const nextPathId = pathId && ids.get(pathId);
    if (pathMatch && pathId && nextPathId) {
      const prefixLength = pathMatch[0].length - pathId.length;
      url.pathname =
        url.pathname.slice(0, prefixLength) +
        nextPathId +
        url.pathname.slice(pathMatch[0].length);
      url.searchParams.delete('resourcekey');
      return toOriginalUrlForm(value, url);
    }

    const parameters = DRIVE_QUERY_PATHS[url.hostname]?.includes(url.pathname)
      ? ['id']
      : APP_ASSET_PATHS.includes(url.pathname)
        ? ['fileId', 'folderId']
        : [];
    let changed = false;
    for (const key of parameters) {
      const nextId = ids.get(url.searchParams.get(key) ?? '');
      if (!nextId) continue;
      changed = true;
      url.searchParams.set(key, nextId);
    }
    if (!changed) return value;
    url.searchParams.delete('resourcekey');
    return toOriginalUrlForm(value, url);
  }

  function visit(value: unknown): unknown {
    if (typeof value === 'string') return remapString(value);
    if (Array.isArray(value)) return value.map(visit);
    if (!isJsonRecord(value)) return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        ids.get(key) ?? key,
        visit(child),
      ])
    );
  }

  return visit(input) as T;
}

export function kakaoFromSavedData(
  payload: Record<string, unknown>
): ShareUrlPayload | null {
  const share = payload.shareUrl;
  if (
    !isJsonRecord(share) ||
    typeof share.title !== 'string' ||
    typeof share.description !== 'string' ||
    typeof share.showLocationButton !== 'boolean'
  ) {
    return null;
  }

  const { locationInfo } = share;
  const image = Array.isArray(share.images) ? share.images[0] : null;
  return {
    title: resolveShareTitle(share.title),
    description: resolveShareDescription(share.description),
    showLocationButton: share.showLocationButton,
    ...(typeof image === 'string' && isDriveFileId(image)
      ? { imageFileId: image }
      : {}),
    ...(share.showLocationButton &&
    isJsonRecord(locationInfo) &&
    typeof locationInfo.lat === 'number' &&
    typeof locationInfo.lng === 'number' &&
    typeof locationInfo.placeName === 'string'
      ? {
          locationInfo: {
            lat: locationInfo.lat,
            lng: locationInfo.lng,
            placeName: locationInfo.placeName,
          },
        }
      : {}),
  };
}
