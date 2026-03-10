import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { MiddlePreviewWrapper } from '@/components/molecules/wrapper/MiddlePreviewWrapper';
import { EditorBlock } from '@/shared/types/block';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'greeting'>;
  className: string;
  titleClassName: string;
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
      <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </MiddlePreviewWrapper>
  );
}

export default GreetingPreview;
