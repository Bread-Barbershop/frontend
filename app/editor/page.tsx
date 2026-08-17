import { Suspense } from 'react';

import EditorCreate from './components/EditorCreate';

const EditorPage = () => {
  return (
    <Suspense fallback={null}>
      <EditorCreate />
    </Suspense>
  );
};
export default EditorPage;
