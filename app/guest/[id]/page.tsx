import 'server-only';

import { buildAudienceGuestUrl } from '@/features/invitation/audiences/model';

import { guestInvitationMetadata } from './server/guestInvitationMetadata';
import {
  getGuestAudienceSlug,
  type GuestSearchParams,
  loadGuestInvitation,
} from './server/loadGuestInvitation';
import { renderGuestInvitationRoute } from './server/renderGuestInvitationRoute';

type GuestPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: GuestSearchParams;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: GuestPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const audienceSlug = getGuestAudienceSlug(query?.to);
  return guestInvitationMetadata(loadGuestInvitation(id, audienceSlug));
}

export default async function GuestPage({
  params,
  searchParams,
}: GuestPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const audienceSlug = getGuestAudienceSlug(query?.to);
  const result = await loadGuestInvitation(id, audienceSlug);

  return renderGuestInvitationRoute(
    result,
    buildAudienceGuestUrl(
      `/guest/${encodeURIComponent(id)}`,
      audienceSlug ?? null
    )
  );
}
