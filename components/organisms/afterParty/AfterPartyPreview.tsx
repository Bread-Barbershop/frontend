import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { safeNavigationUrl } from '../transportation/navigationUrl';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'afterParty'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export function AfterPartyPreview({ blockInfo, titleClassName, className = '', isGuestPage = false, ...rest }: Props) {
  const { title, venue, address, dateTime, description, feeInfo, attendanceNote, mapUrl } = blockInfo.props;
  const nav = safeNavigationUrl(mapUrl);
  const sections = [
    ['장소', venue],
    ['주소', address],
    ['일시', dateTime.replace('T', ' ')],
    ['회비 · 식사', feeInfo],
    ['참석 안내', attendanceNote],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  return (
    <MiddlePreviewWrapper className={className} titleClassName={titleClassName}
      mainTitle={title} mainTitleDefault="피로연 · 애프터파티" {...rest}>
      <div className="flex w-full flex-col gap-3 text-left">
        {description && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">{description}</p>}
        {sections.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-[#FAFAFB] p-4">
            <p className="text-xs font-semibold text-text-primary">{label}</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-text-secondary">{value}</p>
          </div>
        ))}
        {nav && <a className="rounded-md border border-primary px-4 py-3 text-center text-sm font-semibold text-primary"
          href={nav} rel="noopener noreferrer" target="_blank">위치 확인하기</a>}
        {!description && sections.length === 0 && !nav && !isGuestPage &&
          <p className="text-xs text-text-tertiary">별도 행사 정보를 입력해 주세요.</p>}
      </div>
    </MiddlePreviewWrapper>
  );
}
