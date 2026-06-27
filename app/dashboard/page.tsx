import { Suspense } from 'react';

import DashboardCarouselSkeleton from './components/carousel/DashboardCarouselSkeleton';
import DashboardInvitations from './components/DashboardInvitations';
import DashboardTitleActions from './components/title/DashboardTitleActions';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대시보드',
  description:
    '내 초대장을 관리하고 공개 상태와 공유 링크를 설정하는 Invia 대시보드입니다.',
};

export default function DashboardPage() {
  return (
    <>
      <DashboardTitleActions />
      <Suspense fallback={<DashboardCarouselSkeleton />}>
        <DashboardInvitations />
      </Suspense>
    </>
  );
}
