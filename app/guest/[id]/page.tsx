import 'server-only';

import { notFound } from 'next/navigation';

import {
  resolveShareDescription,
  resolveShareImageUrl,
  resolveShareTitle,
} from '@/shared/utils/shareUrlDefaults';

import { GuestAccessNotice } from './components/GuestAccessNotice';
import GuestInvitationView from './components/GuestInvitationView';
import { loadGuestPayload } from './server/loadGuestPayload';

import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const revalidate = false;

const noindexRobots = {
  index: false,
  follow: false,
  nocache: true,
} satisfies NonNullable<Metadata['robots']>;

function renderPrivateInvitationNotice() {
  return (
    <GuestAccessNotice
      title="비공개 초대장이에요"
      description={
        <>
          <span>초대장 주인이 공개로 전환하면</span>
          <span>이 링크에서 다시 확인할 수 있어요.</span>
        </>
      }
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const result = await loadGuestPayload(id);
    if (result.status !== 'ok') {
      return {
        robots: noindexRobots,
      };
    }

    const { payload } = result;
    const topLevelShare = payload.shareUrl;
    const title = resolveShareTitle(topLevelShare?.urlTitle);
    const description = resolveShareDescription(topLevelShare?.urlDescription);
    const imageUrl = resolveShareImageUrl(topLevelShare?.urlImage?.[0]);

    return {
      title,
      description,
      robots: noindexRobots,
      openGraph: {
        title,
        description,
        images: imageUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl,
      },
      icons: {
        icon: '/favicon.ico',
      },
    };
  } catch {
    return {
      robots: noindexRobots,
    };
  }
}

export default async function GuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await loadGuestPayload(id);
  if (result.status === 'private') {
    return renderPrivateInvitationNotice();
  }

  if (result.status === 'not-found') {
    notFound();
  }

  const { payload } = result;

  return <GuestInvitationView payload={payload} mode="guest" />;
}
