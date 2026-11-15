import { Suspense } from 'react';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';

import EditorCreate from './components/EditorCreate';

const EditorPage = async () => {
  const session = await getAuthSession();
  return (
    <Suspense fallback={null}>
      <EditorCreate initialIsLoggedIn={session.isLoggedIn} />
    </Suspense>
  );
};
export default EditorPage;
