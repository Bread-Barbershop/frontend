'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

export function SlotPanel() {
  return (
    <LeftEditorWrapper ariaLabel="슬롯 도구">
      <NavigationBar>슬롯 도구</NavigationBar>
      <div className="w-full px-2 py-5 text-sm leading-6 text-text-secondary">
        슬롯을 추가한 후 자유롭게 위치와 크기를 조정하고,
        <br />
        우클릭 메뉴의 `슬롯으로 변환하기`를 눌러 템플릿 슬롯으로 만드세요.
      </div>
    </LeftEditorWrapper>
  );
}
