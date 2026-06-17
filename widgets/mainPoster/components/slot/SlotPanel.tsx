'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

const uiText = {
  ariaLabel: '\uC2AC\uB86F \uAD6C\uC131',
  title: '\uC2AC\uB86F \uAD6C\uC131',
  description:
    '\uC2AC\uB86F\uC744 \uCD94\uAC00\uD558\uBA74 \uBC14\uB85C \uD15C\uD50C\uB9BF \uC2AC\uB86F\uC73C\uB85C \uC0DD\uC131\uB429\uB2C8\uB2E4.',
  descriptionNext:
    '\uC774\uD6C4 \uC790\uC720\uB86D\uAC8C \uC704\uCE58\uC640 \uD06C\uAE30\uB97C \uC870\uC815\uD574 \uC8FC\uC138\uC694.',
};

export function SlotPanel() {
  return (
    <LeftEditorWrapper ariaLabel={uiText.ariaLabel}>
      <NavigationBar>{uiText.title}</NavigationBar>
      <div className="w-full px-2 py-5 text-sm leading-6 text-text-secondary">
        {uiText.description}
        <br />
        {uiText.descriptionNext}
      </div>
    </LeftEditorWrapper>
  );
}
