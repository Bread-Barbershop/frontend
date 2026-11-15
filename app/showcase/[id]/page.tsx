import { notFound } from 'next/navigation';

import { showcaseItems } from '@/app/(home)/components/showcaseItems';
import { buildShowcaseInvitation } from '@/shared/data/buildShowcaseInvitation';
import {
  getShowcaseInvitation,
  SHOWCASE_INVITATIONS,
} from '@/shared/data/showcaseInvitations';

import ShowcaseDocument from './ShowcaseDocument';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '초대장 미리보기',
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return SHOWCASE_INVITATIONS.map(({ id }) => ({ id }));
}

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const design = getShowcaseInvitation(id);
  const card = showcaseItems.find(item => item.id === id);
  if (!design || !card) notFound();
  const invitation = buildShowcaseInvitation(design);

  return (
    <main style={{ backgroundColor: design.palette[0] }} className="min-h-dvh">
      <div className="mx-auto w-full max-w-[430px]">
        <ShowcaseDocument
          {...invitation}
          design={design}
          cover={card.image}
          coverAlt={card.alt}
        />
      </div>
    </main>
  );
}
