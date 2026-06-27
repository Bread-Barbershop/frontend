import { ReactNode } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function EditorLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <DashboardShell variant="editor">
      {children}
    </DashboardShell>
  );
}
