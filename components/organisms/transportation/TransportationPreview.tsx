import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { safeNavigationUrl } from './navigationUrl';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'transportation'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export function TransportationPreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const props = blockInfo.props;
  const sections = [
    {
      label: '지하철',
      lines: [
        [props.subwayLine, props.subwayStation, props.subwayExit].filter(Boolean).join(' · '),
        props.subwayWalk,
      ].filter(Boolean),
    },
    { label: '버스', lines: [props.busRoutes].filter(Boolean) },
    { label: '셔틀버스', lines: [props.shuttleStop, props.shuttleInterval].filter(Boolean) },
    { label: '자가용 / 주차', lines: [props.parkingHours, props.alternativeParking].filter(Boolean) },
  ].filter(section => section.lines.length > 0);
  const navigationUrl = safeNavigationUrl(props.navigationUrl);

  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      mainTitle={props.title}
      mainTitleDefault="오시는 길 안내"
      {...rest}
    >
      {sections.length === 0 && !navigationUrl && !isGuestPage ? (
        <p className="text-xs text-text-tertiary">교통·주차 정보를 입력해 주세요.</p>
      ) : (
        <div className="flex w-full flex-col gap-3 text-left">
          {sections.map(section => (
            <section key={section.label} className="rounded-lg bg-[#FAFAFB] p-4">
              <h3 className="text-sm font-semibold text-text-primary">{section.label}</h3>
              {section.lines.map((line, index) => (
                <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-text-secondary" key={index}>{line}</p>
              ))}
            </section>
          ))}
          {navigationUrl && (
            <a
              href={navigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-primary px-4 py-3 text-center text-sm font-semibold text-primary"
            >
              내비게이션 바로가기
            </a>
          )}
        </div>
      )}
    </MiddlePreviewWrapper>
  );
}
