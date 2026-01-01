// app/page-name/page.tsx
import type { Metadata } from 'next';

// SEO를 위한 메타데이터 설정 (선택 사항)
export const metadata: Metadata = {
  title: '페이지 제목 | 내 서비스',
  description: '이 페이지에 대한 설명입니다.',
};

export default function PageName() {
  // 여기에 서버 사이드 로직 작성 (DB 직접 접근 등)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">페이지 제목</h1>
      <p>여기에 콘텐츠를 작성하세요.</p>
    </main>
  );
}