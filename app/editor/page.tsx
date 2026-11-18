import { Suspense } from 'react';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';
import { ScreenTransitionLoader } from '@/components/molecules/screen-transition-loader';

import EditorCreate from './components/EditorCreate';

async function EditorPageContent() {
  const session = await getAuthSession();
  return <EditorCreate initialIsLoggedIn={session.isLoggedIn} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={<ScreenTransitionLoader label="에디터를 준비하는 중" />}>
      <EditorPageContent />
    </Suspense>
  );
}
