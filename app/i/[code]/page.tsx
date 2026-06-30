import 'server-only';

import { notFound } from 'next/navigation';

import { resolveShortCode } from '@/app/api/short-url/_lib/shortUrlStore';
import { GuestAccessNotice } from '@/app/guest/[id]/components/GuestAccessNotice';
import GuestInvitationView from '@/app/guest/[id]/components/GuestInvitationView';
import { loadGuestPayload } from '@/app/guest/[id]/server/loadGuestPayload';
import {
  resolveShareDescription,
  resolveShareImageUrl,
  resolveShareTitle,
} from '@/shared/utils/shareUrlDefaults';

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

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

async function resolveDataJsonFileId(code: string) {
  try {
    // 짧은 코드가 없거나 Redis가 불안정하면 게스트 페이지는 404로 안전하게 빠진다.
    return await resolveShortCode(code);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const dataJsonFileId = await resolveDataJsonFileId(code);

  if (!dataJsonFileId) {
    return { robots: noindexRobots };
  }

  try {
    const result = await loadGuestPayload(dataJsonFileId);
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

export default async function ShortGuestPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const dataJsonFileId = await resolveDataJsonFileId(code);

  if (!dataJsonFileId) {
    notFound();
  }

  const result = await loadGuestPayload(dataJsonFileId);
  if (result.status === 'private') {
    return renderPrivateInvitationNotice();
  }

  if (result.status === 'not-found') {
    notFound();
  }

  return <GuestInvitationView payload={result.payload} mode="guest" />;
}
