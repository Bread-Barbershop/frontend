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
    checkedEnglishTitle = true,
    englishTitle = '',
    messageJson,
    messageHtml,
  } = blockInfo.props;
  const html =
    messageHtml ?? tiptapJsonToHtmlUniversal(messageJson);

  return (
    <MiddlePreviewWrapper
      className={className}
      checkedSubTitle={checkedEnglishTitle}
      subTitle={englishTitle}
      subTitleDefault="INVITATION"
      mainTitle={title}
      mainTitleDefault="인사말"
      titleClassName={titleClassName}
      {...rest}
    >
      <PreviewBody html={html} />
    </MiddlePreviewWrapper>
  );
}

export default GreetingPreview;
