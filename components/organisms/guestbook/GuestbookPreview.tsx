import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { safeRsvpFormUrl } from '../rsvp/rsvpFormUrl';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'guestbook'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export function GuestbookPreview({ blockInfo, titleClassName, className = '', isGuestPage = false, ...rest }: Props) {
  const { title, description, formUrl, buttonText } = blockInfo.props;
  const url = safeRsvpFormUrl(formUrl);
  return (
    <MiddlePreviewWrapper className={className} titleClassName={titleClassName}
      mainTitle={title} mainTitleDefault="축하 메시지 남기기" {...rest}>
      {description && <p className="whitespace-pre-wrap break-words text-center text-sm leading-relaxed text-text-secondary">
        {description}
      </p>}
      {url && <a href={url} rel="noopener noreferrer" target="_blank"
        className="w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white">
        {buttonText || '축하 메시지 작성하기'}
      </a>}
      {!url && !isGuestPage && <p className="text-xs text-text-tertiary">구글 설문 응답 링크를 등록해 주세요.</p>}
    </MiddlePreviewWrapper>
  );
}
