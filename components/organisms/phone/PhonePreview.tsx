import { HTMLAttributes } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { EditorBlock } from '@/shared/types/block';

import PhonePreviewPopup from './components/PhonePreviewPopup';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'phone'>;
  className: string;
  hideActions?: boolean;
}

function PhonePreview({ blockInfo, className, hideActions, ...rest }: Props) {
  return (
    <MiddlePreviewWrapper noTitle={true} className={className} {...rest}>
      <PhonePreviewPopup groups={blockInfo.props.groups} hideActions={hideActions} />
    </MiddlePreviewWrapper>
  );
}
export default PhonePreview;
