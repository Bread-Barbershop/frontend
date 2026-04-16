import CarouselWrapper from './components/carousel/CarouselWrapper';
import DashboardTitle from './components/title/DashboardTitle';
import { loadDashboardInvitations } from './server/loadDashboardInvitations';

export const metadata = {
  title: '대시보드',
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
