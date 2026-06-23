import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

import { BackgroundColor } from './BackgroundColor';

export const BackgroundPanel = () => {
  return (
    <LeftEditorWrapper ariaLabel="배경 편집" className="pb-4">
      <div className="flex w-full items-center justify-center">
        <BackgroundColor />
      </div>
    </LeftEditorWrapper>
  );
};