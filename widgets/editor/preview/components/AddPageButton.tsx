import React, { useEffect, useRef, useState } from 'react';

import { EditorCallout } from '@/components/molecules/editor-callout';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';
import { shouldIgnoreEditorShortcut } from '@/shared/utils/editorShortcutGuard';

import ComponentsPopup from './ComponentsPopup';

function AddPageButton() {
  const [isTab, setIsTab] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const isCalloutOpen = useEditorCalloutStore(
    state => state.callouts['add-page-button']
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || shouldIgnoreEditorShortcut(event)) return;

      event.preventDefault();
      setIsTab(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePopClose = () => {
    setIsTab(false);
  };
  return (
    <div ref={buttonContainerRef} className="w-full">
      <ComponentsPopup open={isTab} onPopClose={handlePopClose} />

      <button
        type="button"
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center gap-2 font-semibold text-sm"
        onClick={() => setIsTab(props => !props)}
      >
        +페이지 추가
      </button>
      <EditorCallout
        targetRef={buttonContainerRef}
        open={isCalloutOpen}
        arrowSide="left"
        targetAnchor={{ x: 1, y: 0.5 }}
        offset={0}
        className="max-w-[300px] break-keep text-[14px] leading-5"
        text="페이지 추가를 누르면 블록을 검색할 수 있어요. 입력 중이 아닐 때 / 키를 눌러 바로 열 수 있어요."
      />
    </div>
  );
}

export default AddPageButton;
