import DraftInvitationDocument from './DraftInvitationDocument';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '초대장 미리보기',
  robots: { index: false, follow: false },
};

export default function InvitationPreviewPage() {
  return <DraftInvitationDocument />;
}
