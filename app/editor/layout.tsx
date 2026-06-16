import { ReactNode } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';

import EditorViewportGuard from './components/EditorViewportGuard';

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
      <EditorViewportGuard>{children}</EditorViewportGuard>
    </DashboardShell>
  );
}
