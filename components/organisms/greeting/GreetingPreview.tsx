import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { EditorBlock } from '@/shared/types/block';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'greeting'>;
  titleClassName: string;
}

function GreetingPreview({
  blockInfo,
  className = '',
  titleClassName,
  ...rest
}: Props) {
  const html =
    blockInfo.props.messageHtml ??
    tiptapJsonToHtmlUniversal(blockInfo.props.messageJson);

  return (
    <div className={`px-5 ${className}`} {...rest}>
      <PreviewTitle
        enTitle="INVITATION"
        koTitle={blockInfo.props.title}
        className="mb-6"
        titleClassName={titleClassName}
      />
      <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default GreetingPreview;
