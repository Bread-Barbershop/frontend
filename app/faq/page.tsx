import DashboardShell from '@/features/session/components/DashboardShell';

import FaqContent from './components/FaqContent';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Invia 서비스 이용에 관한 자주 묻는 질문과 답변입니다.',
};

function FaqPage() {
  return (
    <DashboardShell>
      <FaqContent />
    </DashboardShell>
  );
}

export default FaqPage;
