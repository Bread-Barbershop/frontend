import 'server-only';
import { notFound } from 'next/navigation';

import GuestBgm from './components/GuestBgm';
import { GuestMainPoster } from './components/GuestMainPoster';
import GuestRenderer from './components/GuestRenderer';
import { DEFAULT_IMAGE_URL } from './constants/constant';
import { isGuestPayload } from './utils/guestBlockTypeGuards';

import type { Metadata } from 'next';

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

    const shareBlock = payload.blocks.find(
      (b: any) => b.component === 'shareUrl'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadataProps = (shareBlock?.props as Record<string, any>) || {};

    const title = metadataProps?.urlTitle || '초대장';
    const description =
      metadataProps?.urlDescription || '소중한 분들을 초대합니다.';

    const rawImageUrl = metadataProps?.urlImage?.[0];

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
        className="relative mx-auto w-full max-w-[430px] bg-white shadow-sm"
        style={{
          backgroundColor: payload.bulkData.backgroundColor,
        }}
      >
        <GuestMainPoster json={payload.mainPoster} />
        <GuestRenderer blocks={payload.blocks} bulkData={payload.bulkData} />
        <GuestBgm bgm={payload.bgm} />
      </div>
    </main>
  );
}
