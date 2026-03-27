import { ReactNode } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';

export default function HomeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}
