import 'server-only';
import { notFound } from 'next/navigation';

import GuestRenderer from './components/GuestRenderer';
import { isGuestBlocks } from './utils/guestBlockTypeGuards';

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

  const json = (await res.json()) as unknown;
  if (!isGuestBlocks(json)) notFound();

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-xl bg-white shadow-sm">
        <GuestRenderer blocks={json} />
      </div>
    </main>
  );
}
