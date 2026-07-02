import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

import { BackgroundColor } from './BackgroundColor';

export const BackgroundColorPanel = () => {
  return (
    <LeftEditorWrapper
      ariaLabel="배경색 편집"
      className="relative z-20 overflow-visible pb-0"
    >
      <div className="flex w-full items-center justify-center">
        <BackgroundColor />
      </div>
    </LeftEditorWrapper>
  );
};
