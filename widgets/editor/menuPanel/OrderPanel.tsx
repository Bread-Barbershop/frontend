import AdditionalFeaturesButton from '../preview/components/AdditionalFeaturesButton';
import AddPageButton from '../preview/components/AddPageButton';
import InvitationPreviewButton from '../preview/components/InvitationPreviewButton';
import OrderPanel from '../preview/components/OrderPanel';
import { ShareUrlButton } from '../preview/components/ShareUrlButton';
import UploadButton from '../preview/components/UploadButton';

function MenuPanel() {
  return (
    <div className="w-28 flex flex-col gap-4">
      <OrderPanel />
      <AddPageButton />
      <ShareUrlButton />
      <AdditionalFeaturesButton />
      <InvitationPreviewButton />
      <UploadButton />
    </div>
  );
}

export default MenuPanel;
