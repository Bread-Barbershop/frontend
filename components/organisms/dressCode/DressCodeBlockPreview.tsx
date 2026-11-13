import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { normalizeDressCodeColors, normalizeDressCodeGuidelines } from './dressCodeUtils';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'dressCode'>;
  isGuestPage?: boolean;
  titleClassName?: string;
}

export function DressCodeBlockPreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const colors = normalizeDressCodeColors(blockInfo.props.colors);
  const guidelines = normalizeDressCodeGuidelines(blockInfo.props.guidelines).filter(Boolean);
  const title = blockInfo.props.title || '드레스 코드';

  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      mainTitle={title}
      mainTitleDefault="드레스 코드"
      {...rest}
    >
      <div className="flex w-full flex-col items-center gap-5">
        {colors.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3" aria-label="추천 드레스 컬러">
            {colors.map((color, index) => (
              <div
                key={index}
                title={color}
                aria-label={`추천 색상 ${index + 1}: ${color}`}
                className="size-9 rounded-full border border-black/5 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
        {guidelines.length > 0 ? (
          <ul className="flex w-full flex-col gap-2 px-1">
            {guidelines.map((guideline, index) => (
              <li key={index} className="rounded-lg bg-[#FAFAFB] px-4 py-3 text-center text-sm leading-relaxed text-text-secondary whitespace-pre-wrap break-words">
                {guideline}
              </li>
            ))}
          </ul>
        ) : (
          !isGuestPage && <p className="text-xs text-text-tertiary">매너 안내 문구를 추가해 주세요.</p>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
}
