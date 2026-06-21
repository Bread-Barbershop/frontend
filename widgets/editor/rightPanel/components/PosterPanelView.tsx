import { memo } from 'react';

import { TemplateItem } from '@/app/api/template/types';
import { Image } from '@/components/atoms/image';
import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { cn } from '@/shared/utils/cn';

interface PosterPanelViewProps {
  templates: TemplateItem[];
  readyTemplateIds: Set<string>;
  onSelectTemplate: (template: TemplateItem) => void;
}

export const PosterPanelView = memo(function PosterPanelView({
  templates,
  readyTemplateIds,
  onSelectTemplate,
}: PosterPanelViewProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-wrap content-start gap-3.5 overflow-y-scroll scrollbar-hide">
      {templates.map(template => {
        const isReady = readyTemplateIds.has(template.id);

        return (
          <button
            type="button"
            key={template.id}
            disabled={!isReady}
            className={cn(
              'group relative aspect-[1/2] h-[347px] w-40 overflow-hidden rounded-lg border border-text-primary/5 bg-[#FAFAFB] text-left',
              isReady
                ? 'transition-shadow hover:shadow-md'
                : 'cursor-progress opacity-80'
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <Image
              src={template.thumbnailUrl}
              alt={template.name}
              fill
              sizes="160px"
              quality={100}
              className="object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {template.name}
            </div>

            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-white">
                <LoadingSpinner className="h-6 w-6 animate-spin" />
                <span className="text-xs font-medium">준비 중...</span>
              </div>
            )}
          </button>
        );
      })}

      <div className="sticky bottom-0 left-0 right-0 flex h-13 w-full items-end justify-center bg-linear-to-t from-white from-0% via-white/24 via-53% to-white/6 to-100%"></div>
    </div>
  );
});
