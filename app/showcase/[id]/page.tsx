import Image from 'next/image';
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
      <article
        className="mx-auto w-full max-w-[430px]"
        aria-label={`${design.name} 초대장`}
      >
        <Image
          src={card.image}
          alt={card.alt}
          priority
          sizes="(max-width: 430px) 100vw, 430px"
          className="block h-auto w-full"
        />
        <ShowcaseDocument {...invitation} />
        <footer
          className="px-6 pb-10 pt-8 text-center"
          style={{ color: design.palette[2] }}
        >
          <p className="text-[11px] tracking-[0.16em]">
            SPECIAL MOMENTS WITH <strong>INVIA</strong>
          </p>
          <p className="mt-3 text-[10px] leading-5 opacity-60">
            디자인 샘플 · 인물, 장소와 일정은 예시입니다.
          </p>
        </footer>
      </article>
    </main>
  );
}
