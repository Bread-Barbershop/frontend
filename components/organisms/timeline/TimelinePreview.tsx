import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { normalizeTimelineItems } from './timelineItems';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'timeline'>;
  isGuestPage?: boolean;
  titleClassName?: string;
}

export function TimelinePreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const items = normalizeTimelineItems(blockInfo.props.items);
  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      mainTitle={blockInfo.props.title}
      mainTitleDefault="행사 일정"
      {...rest}
    >
      {items.length === 0 ? (
        !isGuestPage && <p className="text-xs text-text-tertiary">식순을 추가해주세요.</p>
      ) : (
        <ol className="relative flex w-full flex-col gap-5 border-l border-border-divider px-3 text-left">
          {items.map(item => (
            <li key={item.id} className="relative pl-4">
              <span aria-hidden="true" className="absolute -left-[17px] top-1.5 size-2 rounded-full bg-primary" />
              {item.time && <time className="text-xs font-semibold text-primary">{item.time}</time>}
              <p className="mt-1 break-words text-sm font-semibold text-text-primary">{item.title}</p>
              {item.description && <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-text-secondary">{item.description}</p>}
            </li>
          ))}
        </ol>
      )}
    </MiddlePreviewWrapper>
  );
}
