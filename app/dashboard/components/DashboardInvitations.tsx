import { loadDashboardInvitations } from '../server/loadDashboardInvitations';

import CarouselWrapper from './carousel/CarouselWrapper';

async function DashboardInvitations() {
  const dashboardState = await loadDashboardInvitations()
    .then(data => ({
      initialInvites: data.invites,
      loadOnMount: false,
    }))
    .catch(() => ({
      initialInvites: [],
      loadOnMount: true,
    }));

  return (
    <CarouselWrapper
      initialInvites={dashboardState.initialInvites}
      loadOnMount={dashboardState.loadOnMount}
    />
  );
}

export default DashboardInvitations;
