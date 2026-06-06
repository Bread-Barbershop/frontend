import { ReactNode } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';

import EditorViewportGuard from './components/EditorViewportGuard';

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
