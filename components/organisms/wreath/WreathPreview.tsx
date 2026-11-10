import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { theWreathProvider } from '@/features/wreath/providers/theWreathProvider';
import type { EditorBlock } from '@/shared/types/block';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'wreath'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export function WreathPreview({ blockInfo, titleClassName, className = '', ...rest }: Props) {
  const p = blockInfo.props;
  const url = theWreathProvider.generateOrderUrl({
    weddingHallName: p.hallName,
    weddingHallAddress: p.hallAddress,
    weddingDate: p.eventDate,
    groomName: p.groomName,
    brideName: p.brideName,
    partnerCode: p.partnerCode,
  });
  return (
    <MiddlePreviewWrapper className={className} titleClassName={titleClassName}
      mainTitle={p.title} mainTitleDefault="축하 화환 안내" {...rest}>
      <div className="flex w-full flex-col items-center gap-4">
        <p className="whitespace-pre-wrap break-words text-center text-sm leading-relaxed text-text-secondary">
          {p.mode === 'order' ? p.orderMessage : p.declineMessage}
        </p>
        {p.mode === 'order' && (
          <a className="w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
            href={url} rel="noopener noreferrer" target="_blank">화환 주문 안내 페이지</a>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
}
