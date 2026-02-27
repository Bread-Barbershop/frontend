import { EditorBlock } from '@/shared/types/block';

import PhonePreviewPopup from './components/PhonePreviewPopup';

interface Props {
  blockInfo: EditorBlock<'phone'>;
}

function PhonePreview({ blockInfo }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <PhonePreviewPopup contacts={blockInfo.props.contacts} />
    </div>
  );
}
export default PhonePreview;
