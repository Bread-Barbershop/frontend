import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { safeRsvpFormUrl } from './rsvpFormUrl';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'rsvp'>;
  isGuestPage?: boolean;
  titleClassName?: string;
}

export function RsvpPreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const { title, description, formUrl, buttonText } = blockInfo.props;
  const url = safeRsvpFormUrl(formUrl);

  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      mainTitle={title}
      mainTitleDefault="참석 여부 안내"
      {...rest}
    >
      <div className="flex w-full flex-col items-center gap-4 px-2">
        {description && <p className="whitespace-pre-wrap break-words text-center text-sm leading-relaxed text-text-secondary">{description}</p>}
        {url ? (
          <a
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            className="w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
          >
            {buttonText || '참석 여부 응답하기'}
          </a>
        ) : (
          !isGuestPage && <p className="text-xs text-text-tertiary">구글 설문 응답 링크를 등록하면 버튼이 표시됩니다.</p>
        )}
        {url && (
          <p className="text-center text-[11px] leading-relaxed text-text-tertiary">
            응답은 Google Forms로 제출됩니다. 스프레드시트 저장 여부는 주최자 설정에 따라 달라집니다.
          </p>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
}
