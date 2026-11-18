'use client';

import AdditionalFeaturesButton from '../preview/components/AdditionalFeaturesButton';
import AddPageButton from '../preview/components/AddPageButton';
import InvitationAudiencesButton from '../preview/components/InvitationAudiencesButton';
import InvitationPreviewButton from '../preview/components/InvitationPreviewButton';
import OrderPanel from '../preview/components/OrderPanel';
import { ShareUrlButton } from '../preview/components/ShareUrlButton';
import UploadButton from '../preview/components/UploadButton';
import { useInvitationUpload } from '../preview/hooks/useInvitationUpload';

function MenuPanel({ audienceName }: { audienceName?: string }) {
  const upload = useInvitationUpload();

  return (
    <div className="w-28 flex flex-col gap-4">
      <OrderPanel />
      <AddPageButton />
      <ShareUrlButton />
      <AdditionalFeaturesButton />
      <InvitationAudiencesButton upload={upload} audienceName={audienceName} />
      <InvitationPreviewButton />
      <UploadButton upload={upload} />
    </div>
  );
}

export default MenuPanel;
