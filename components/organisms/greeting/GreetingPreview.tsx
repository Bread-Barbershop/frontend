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
  const html =
    blockInfo.props.messageHtml ??
    tiptapJsonToHtmlUniversal(blockInfo.props.messageJson);

  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="INVITATION"
      koTitle={blockInfo.props.title}
      titleClassName={titleClassName}
      {...rest}
    >
      <PreviewBody html={html} />
    </MiddlePreviewWrapper>
  );
}

export default GreetingPreview;
