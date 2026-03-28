import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import type { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { MemberPreview } from './MemberPreview';

interface Props {
  className: string;
  titleClassName: string;
  blockInfo: EditorBlock<'myFamily'>;
}

export const MyFamilyPreview = ({
  className,
  titleClassName,
  blockInfo,
}: Props) => {
  const { title, family, messageHtml, messageJson, checkedTitle } =
    blockInfo.props;
  const html =
    messageHtml ?? tiptapJsonToHtmlUniversal(messageJson ?? undefined);
  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="MY FAMILY"
      koTitle={checkedTitle ? title : ''}
      titleClassName={titleClassName}
      childClassName="w-full flex flex-col gap-6"
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
      <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </MiddlePreviewWrapper>
  );
};
