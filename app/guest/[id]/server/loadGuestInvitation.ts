import 'server-only';

import { cache } from 'react';

import {
  readAudienceVisibility,
  resolveAudienceLink,
} from '@/app/api/drive/_lib/audienceLinkStore';
import { isShortUrlStoreConfigured } from '@/app/api/short-url/_lib/shortUrlStore';
import { validateAudienceSlug } from '@/features/invitation/audiences/model';

import {
  loadGuestPayload,
  type LoadGuestPayloadResult,
} from './loadGuestPayload';

export type GuestSearchParams = Promise<{ to?: string | string[] }>;

// undefined is the original route. null is an invalid, explicitly supplied group.
export function getGuestAudienceSlug(to: string | string[] | undefined) {
  if (to === undefined) return undefined;
  if (typeof to !== 'string' || to !== to.trim() || validateAudienceSlug(to))
    return null;
  return to;
}

export type GuestInvitationResult =
  | LoadGuestPayloadResult
  | { status: 'invalid-audience' }
  | { status: 'audience-unavailable' }
  | { status: 'missing-short-code' };

export const loadGuestInvitation = cache(
  async (
    rootDataFileId: string,
    audienceSlug: string | null | undefined
  ): Promise<GuestInvitationResult> => {
    if (audienceSlug === null) return { status: 'invalid-audience' };

    const root = await loadGuestPayload(rootDataFileId);
    if (audienceSlug === undefined) return root;
    if (root.status === 'not-found') return { status: 'invalid-audience' };

    let childDataFileId: string | null;
    try {
      if (root.status !== 'ok' && root.status !== 'private') return root;
      const scope = isShortUrlStoreConfigured()
        ? await readAudienceVisibility(rootDataFileId)
        : null;
      if (
        scope &&
        (!scope.published ||
          scope.pending ||
          !scope.publicSlugs.includes(audienceSlug))
      ) {
        return { status: 'private' };
      }
      // A child can be public independently when the owner turned off the base link.
      if (
        root.status === 'private' &&
        (!scope || scope.publicSlugs.includes(''))
      )
        return root;
      childDataFileId = await resolveAudienceLink(rootDataFileId, audienceSlug);
    } catch {
      return { status: 'audience-unavailable' };
    }
    if (!childDataFileId) return { status: 'invalid-audience' };

    const child = await loadGuestPayload(childDataFileId);
    return child.status === 'not-found'
      ? { status: 'invalid-audience' }
      : child;
  }
);
