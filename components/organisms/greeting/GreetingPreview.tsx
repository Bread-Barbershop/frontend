import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import type { EditorBlock } from '@/widgets/editor/store/useEditorStore';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'greeting'>;
}

function GreetingPreview({ blockInfo, className = '', ...rest }: Props) {
  const html = tiptapJsonToHtmlUniversal(blockInfo.props.messageJson);

  return (
    <div className={`px-5 ${className}`} {...rest}>
      <PreviewTitle
        enTitle="INVITATION"
        koTitle={blockInfo.props.title}
        className="mb-6"
      />
      <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default GreetingPreview;
