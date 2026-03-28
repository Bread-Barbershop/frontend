import 'server-only';
import { notFound } from 'next/navigation';

import GuestBgm from './components/GuestBgm';
import { GuestMainPoster } from './components/GuestMainPoster';
import GuestRenderer from './components/GuestRenderer';
import { isGuestPayload } from './utils/guestBlockTypeGuards';

export const dynamic = 'force-static';
export const revalidate = false;

function publicDataJsonUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
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
        className="relative mx-auto w-full max-w-93.75 bg-white shadow-sm"
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
