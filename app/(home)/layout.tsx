import { ReactNode } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/features/session/config/dashboardShell.config';

export default function HomeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <DashboardShell minimumWidth={DESKTOP_CONTENT_MIN_WIDTH}>
      {children}
    </DashboardShell>
  );
}
