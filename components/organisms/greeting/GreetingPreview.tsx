import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor-bar/utils/tiptapJsonToHtml';
import type { EditorBlock } from '@/widgets/editor/store/useEditorStore';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'greeting'>;
}

function GreetingPreview({ blockInfo, className = '', ...rest }: Props) {
  const html = blockInfo.props.messageJson
    ? tiptapJsonToHtmlUniversal(blockInfo.props.messageJson as any)
    : `<p>${blockInfo.props.message ?? ''}</p>`;

  return (
    <div className={`px-5 ${className}`} {...rest}>
      <PreviewTitle enTitle="INVITATION" koTitle={blockInfo.props.title} />
      <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default GreetingPreview;
