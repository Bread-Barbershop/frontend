import { ReactNode } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/features/session/config/dashboardShell.config';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({
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
