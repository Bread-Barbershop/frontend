import 'server-only';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '@/shared/utils/shareUrlDefaults';

import GuestBgm from './components/GuestBgm';
import { GuestMainPoster } from './components/GuestMainPoster';
import GuestRenderer from './components/GuestRenderer';
import { DEFAULT_IMAGE_URL } from './constants/constant';
import { isGuestPayload } from './utils/guestBlockTypeGuards';

export const dynamic = 'force-static';
export const revalidate = false;

function publicDataJsonUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(publicDataJsonUrl(id), {
      next: { tags: [`invitation:${id}`] },
    });

    if (!res.ok) return {};

    const raw = await res.text();
    const payload = JSON.parse(raw);

    if (!isGuestPayload(payload)) {
      return {};
    }

    const topLevelShare = payload.shareUrl;
    const title = topLevelShare?.urlTitle || DEFAULT_TITLE;
    const description = topLevelShare?.urlDescription || DEFAULT_DESCRIPTION;
    const rawImageUrl = topLevelShare?.urlImage?.[0];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: rawImageUrl
          ? `https://lh3.googleusercontent.com/d/${rawImageUrl}`
          : DEFAULT_IMAGE_URL,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: rawImageUrl
          ? `https://lh3.googleusercontent.com/d/${rawImageUrl}`
          : DEFAULT_IMAGE_URL,
      },
      icons: {
        icon: '/favicon.ico',
      },
    };
  } catch (error) {
    console.error('Metadata generation failed:', error);
    return {};
  }
}

export default async function GuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(publicDataJsonUrl(id), {
    next: { tags: [`invitation:${id}`] },
  });

  if (!res.ok) notFound();

  const raw = await res.text();
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    notFound();
  }
  if (!isGuestPayload(payload)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div
        id="preview-container"
        className="relative mx-auto w-full min-w-[375px] max-w-[430px] bg-white shadow-sm"
        style={{
          backgroundColor: payload.bulkData.backgroundColor,
        }}
      >
        <div className="sticky top-0 z-50 h-0">
          <GuestBgm bgm={payload.bgm} />
        </div>
        <GuestMainPoster
          thumbnailFileId={payload.mainPoster.thumbnailFileId ?? ''}
        />
        <div className="mx-auto w-full">
          <GuestRenderer blocks={payload.blocks} bulkData={payload.bulkData} />
        </div>
      </div>
    </main>
  );
}
