import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { EditorBlock } from '@/shared/types/block';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'greeting'>;
  className: string;
  titleClassName?: string;
}

function GreetingPreview({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) {
  const {
    title,
    checkedEnglishTitle = false,
    englishTitle = '',
    messageJson,
    messageHtml,
  } = blockInfo.props;
  const html =
    messageHtml ?? tiptapJsonToHtmlUniversal(messageJson);

  return (
    <MiddlePreviewWrapper
      className={className}
      checkedEnglishTitle={checkedEnglishTitle}
      enTitle={englishTitle}
      enTitleDefault="INVITATION"
      koTitle={title}
      koTitleDefault="인사말"
      titleClassName={titleClassName}
      {...rest}
    >
      <PreviewBody html={html} />
    </MiddlePreviewWrapper>
  );
}

export default GreetingPreview;
