import { HTMLAttributes } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { EditorBlock } from '@/shared/types/block';

import PhonePreviewPopup from './components/PhonePreviewPopup';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'phone'>;
  className: string;
}

function PhonePreview({ blockInfo, className, ...rest }: Props) {
  return (
    <MiddlePreviewWrapper noTitle={true} className={className} {...rest}>
      <PhonePreviewPopup contacts={blockInfo.props.contacts} />
    </MiddlePreviewWrapper>
  );
}
export default PhonePreview;
