import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import type { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { MemberPreview } from './MemberPreview';

interface Props {
  className: string;
  titleClassName?: string;
  blockInfo: EditorBlock<'myFamily'>;
}

export const MyFamilyPreview = ({
  className,
  titleClassName,
  blockInfo,
  ...rest
}: Props) => {
  const {
    title,
    family,
    messageHtml,
    messageJson,
    checkedEnglishTitle,
    englishTitle,
  } = blockInfo.props;
  const html =
    messageHtml ?? tiptapJsonToHtmlUniversal(messageJson ?? undefined);

  return (
    <MiddlePreviewWrapper
      className={className}
      checkedEnglishTitle={checkedEnglishTitle}
      enTitle={englishTitle}
      enTitleDefault="MY FAMILY"
      koTitle={title}
      koTitleDefault="저희 가족을 소개합니다."
      titleClassName={titleClassName}
      childClassName="w-full flex flex-col gap-6"
      {...rest}
    >
      <div className="flex flex-row flex-wrap justify-center gap-x-4.5 gap-y-8 w-full">
        {family?.map((member, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-4.5 w-[calc(50%-9px)] max-w-[158.5px]"
          >
            <MemberPreview member={member} />
          </div>
        ))}
      </div>
      <PreviewBody html={html} />
    </MiddlePreviewWrapper>
  );
};
