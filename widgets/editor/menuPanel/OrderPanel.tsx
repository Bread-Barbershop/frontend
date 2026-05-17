import AddPageButton from '../preview/components/AddPageButton';
import OrderPanel from '../preview/components/OrderPanel';
import { ShareUrlButton } from '../preview/components/ShareUrlButton';
import UploadButton from '../preview/components/UploadButton';

function MenuPanel() {
  return (
    <div className="w-28 flex flex-col gap-4">
      <OrderPanel />
      <AddPageButton />
      <ShareUrlButton />
      <UploadButton />
    </div>
  );
}

export default MenuPanel;
