import { Suspense } from 'react';

import DashboardCarouselSkeleton from './components/carousel/DashboardCarouselSkeleton';
import DashboardInvitations from './components/DashboardInvitations';
import DashboardCreateInvitationButton from './components/title/DashboardCreateInvitationButton';
import DashboardTitle from './components/title/DashboardTitle';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대시보드',
  description:
    '내 초대장을 관리하고 공개 상태와 공유 링크를 설정하는 Invia 대시보드입니다.',
};

export default function DashboardPage() {
  return (
    <>
      <div
        className="pointer-events-none fixed z-10 flex flex-col items-end gap-10"
        style={{ right: '2.5rem', top: '30%' }}
      >
        <DashboardTitle />
        <DashboardCreateInvitationButton />
      </div>
      <Suspense fallback={<DashboardCarouselSkeleton />}>
        <DashboardInvitations />
      </Suspense>
    </>
  );
}
