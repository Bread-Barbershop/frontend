'use client';

import { Eye, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import ShowcasePreviewProvider, {
  useShowcasePreview,
} from '@/features/showcase/components/ShowcasePreviewProvider';
import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';
import type { InvitationTemplate } from '@/shared/data/invitationTemplates/types';
import InvitationTemplatePoster from '@/widgets/editor/preview/components/InvitationTemplatePoster';

const ACTION_CLASS =
  'grid min-h-11 cursor-pointer grid-cols-[28px_1fr_28px] items-center rounded-lg p-2 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';
const ACTION_STYLE = {
  boxShadow: '0 8px 24px 0 rgb(0 0 0 / 6%), 0 2px 10px 0 rgb(0 0 0 / 8%)',
};

export default function GalleryTemplateGrid() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const templates =
    category === 'all'
      ? INVITATION_TEMPLATES
      : INVITATION_TEMPLATES.filter(template => template.type === category);

  return (
    <ShowcasePreviewProvider
      key={category}
      invitationIds={templates.map(({ id }) => id)}
    >
      <GalleryTemplateCards templates={templates} />
    </ShowcasePreviewProvider>
  );
}

function GalleryTemplateCards({
  templates,
}: {
  templates: InvitationTemplate[];
}) {
  const openPreview = useShowcasePreview();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) return;

    function clearSelection(event: PointerEvent) {
      if (
        event.target instanceof Element &&
        !event.target.closest('[data-gallery-template-card], dialog[open]')
      ) {
        setSelectedId(null);
      }
    }

    document.addEventListener('pointerdown', clearSelection);
    return () => document.removeEventListener('pointerdown', clearSelection);
  }, [selectedId]);

  return (
    <section
      aria-label="초대장 디자인"
      className="mt-10 grid w-full max-w-[1836px] grid-cols-[repeat(auto-fit,min(240px,100%))] justify-start gap-x-[26px] gap-y-10"
    >
      {templates.map(template => {
        const isSelected = selectedId === template.id;

        return (
          <article
            key={template.id}
            data-gallery-template-card
            className="group relative aspect-[375/812] overflow-hidden rounded-2xl bg-white/72 shadow-edit backdrop-blur-sm motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-1"
          >
            <button
              type="button"
              aria-label={template.name}
              aria-pressed={isSelected}
              className="absolute inset-0 w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2"
              onClick={event => {
                setSelectedId(template.id);
                event.currentTarget.scrollIntoView({
                  block: 'center',
                  inline: 'nearest',
                });
              }}
            >
              <span className="block h-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]">
                <InvitationTemplatePoster template={template} sizes="240px" />
              </span>
            </button>

            {isSelected ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-2 bg-black/16 px-5 py-8">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  className={`pointer-events-auto bg-bg-plain text-white hover:bg-[#202020] ${ACTION_CLASS}`}
                  style={ACTION_STYLE}
                  onClick={() => openPreview(template.id)}
                >
                  <Eye className="size-5" aria-hidden="true" />
                  디자인 미리보기
                </button>
                <Link
                  href={`/editor?template=${encodeURIComponent(template.id)}`}
                  className={`pointer-events-auto bg-white text-text-plain hover:bg-[#FAFAFB] ${ACTION_CLASS}`}
                  style={ACTION_STYLE}
                >
                  <Pencil className="size-5" aria-hidden="true" />이 디자인으로
                  만들기
                </Link>
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-0 transition-colors duration-200 group-hover:bg-black/6" />
            )}
          </article>
        );
      })}

      {templates.length === 0 && (
        <div className="col-span-full rounded-2xl bg-white/72 p-8 text-lg font-semibold text-text-secondary shadow-edit backdrop-blur-sm">
          해당 카테고리에 등록된 디자인이 없습니다.
        </div>
      )}
    </section>
  );
}
