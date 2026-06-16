import DashboardShell from '@/features/session/components/DashboardShell';

import FaqContent from './components/FaqContent';
import { FAQ_ITEMS } from './data';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Invia 서비스 이용에 관한 자주 묻는 질문과 답변입니다.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ | Invia',
    description: 'Invia 서비스 이용에 관한 자주 묻는 질문과 답변입니다.',
    url: '/faq',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

function FaqPage() {
  return (
    <DashboardShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <FaqContent />
    </DashboardShell>
  );
}

export default FaqPage;
