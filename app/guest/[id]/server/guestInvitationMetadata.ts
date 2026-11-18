import 'server-only';

import {
  resolveShareDescription,
  resolveShareImageUrl,
  resolveShareTitle,
} from '@/shared/utils/shareUrlDefaults';

import type { GuestInvitationResult } from './loadGuestInvitation';
import type { Metadata } from 'next';

const noindexRobots = {
  index: false,
  follow: false,
  nocache: true,
} satisfies NonNullable<Metadata['robots']>;

export async function guestInvitationMetadata(
  result: Promise<GuestInvitationResult>
): Promise<Metadata> {
  try {
    const invitation = await result;
    if (invitation.status !== 'ok') return { robots: noindexRobots };

    const shareUrl = invitation.payload.shareUrl;
    const title = resolveShareTitle(shareUrl?.urlTitle);
    const description = resolveShareDescription(shareUrl?.urlDescription);
    const images = resolveShareImageUrl(shareUrl?.urlImage?.[0]);

    return {
      title,
      description,
      robots: noindexRobots,
      openGraph: { title, description, images },
      twitter: { card: 'summary_large_image', title, description, images },
      icons: { icon: '/favicon.ico' },
    };
  } catch {
    return { robots: noindexRobots };
  }
}
