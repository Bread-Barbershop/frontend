'use client';

import { useViewportScale } from '@/shared/hooks/useViewportScale';

import DashboardCreateInvitationButton from './DashboardCreateInvitationButton';
import DashboardTitle from './DashboardTitle';

function DashboardTitleActions() {
  const scale = useViewportScale();

  return (
    <div
      className="pointer-events-none fixed z-10 flex flex-col items-end"
      style={{ right: '2.5rem', top: '30%' }}
    >
      <section
        className="flex origin-top-right flex-col items-end gap-10"
        style={{ transform: `scale(${scale})` }}
      >
        <DashboardTitle />
        <DashboardCreateInvitationButton />
      </section>
    </div>
  );
}

export default DashboardTitleActions;
