import { HTMLAttributes } from 'react';

import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'closingComment'>;
  className: string;
  titleClassName?: string;
}

function ClosingCommentPreview({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) {
  const { messageJson, messageHtml } = blockInfo.props;
  const html = messageHtml ?? tiptapJsonToHtmlUniversal(messageJson);
  return (
    <MiddlePreviewWrapper
      className={className}
      noTitle={true}
      titleClassName={titleClassName}
      {...rest}
    >
      <PreviewBody html={html} />
    </MiddlePreviewWrapper>
  );
}
export default ClosingCommentPreview;
