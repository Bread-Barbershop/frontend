import CarouselWrapper from './components/carousel/CarouselWrapper';
import DashboardTitle from './components/title/DashboardTitle';
import { loadDashboardInvitations } from './server/loadDashboardInvitations';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대시보드',
  description: '내 초대장을 관리하고 발행하는 Invia 대시보드입니다.',
};

export default async function DashboardPage() {
  const initialData = await loadDashboardInvitations().catch(() => ({
    invites: [],
  }));

  return (
    <>
      <div
        className="pointer-events-none fixed z-10"
        style={{ right: '2.5rem', top: '30%' }}
      >
        <DashboardTitle />
      </div>
      <CarouselWrapper initialInvites={initialData.invites} />
    </>
  );
}
