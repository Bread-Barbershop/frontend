import 'server-only';

import { cache } from 'react';

import {
  isShortUrlStoreConfigured,
  resolveShortCode,
} from '@/app/api/short-url/_lib/shortUrlStore';
import { guestInvitationMetadata } from '@/app/guest/[id]/server/guestInvitationMetadata';
import {
  getGuestAudienceSlug,
  type GuestInvitationResult,
  type GuestSearchParams,
  loadGuestInvitation,
} from '@/app/guest/[id]/server/loadGuestInvitation';
import { renderGuestInvitationRoute } from '@/app/guest/[id]/server/renderGuestInvitationRoute';
import { buildAudienceGuestUrl } from '@/features/invitation/audiences/model';

type ShortGuestPageProps = {
  params: Promise<{ code: string }>;
  searchParams?: GuestSearchParams;
};

export const dynamic = 'force-dynamic';

const loadShortGuestInvitation = cache(
  async (
    code: string,
    audienceSlug: string | null | undefined
  ): Promise<GuestInvitationResult> => {
    if (audienceSlug === null) return { status: 'invalid-audience' };

    let dataJsonFileId: string | null;
    try {
      dataJsonFileId = await resolveShortCode(code);
    } catch {
      return {
        status: audienceSlug ? 'audience-unavailable' : 'missing-short-code',
      };
    }
    if (!dataJsonFileId) {
      if (!audienceSlug) return { status: 'missing-short-code' };
      return {
        status: isShortUrlStoreConfigured()
          ? 'invalid-audience'
          : 'audience-unavailable',
      };
    }

    return loadGuestInvitation(dataJsonFileId, audienceSlug);
  }
);

export async function generateMetadata({
  params,
  searchParams,
}: ShortGuestPageProps) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  const audienceSlug = getGuestAudienceSlug(query?.to);
  return guestInvitationMetadata(loadShortGuestInvitation(code, audienceSlug));
}

export default async function ShortGuestPage({
  params,
  searchParams,
}: ShortGuestPageProps) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  const audienceSlug = getGuestAudienceSlug(query?.to);
  const result = await loadShortGuestInvitation(code, audienceSlug);

  return renderGuestInvitationRoute(
    result,
    buildAudienceGuestUrl(
      `/i/${encodeURIComponent(code)}`,
      audienceSlug ?? null
    )
  );
}
