'use client';

import { useShallow } from 'zustand/shallow';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditorPreview } from '@/components/molecules/preview-text-editor';
import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import { TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { toStyle } from '@/shared/utils/toStyle';

type TitleEditProps = {
  activeColorPickerId: BulkColorPickerId | null;
  onActiveColorPickerChange: (id: BulkColorPickerId | null) => void;
};

function TitleEdit({
  activeColorPickerId,
  onActiveColorPickerChange,
}: TitleEditProps) {
  const { titleData, setTitleData } = useEditorStore(
    useShallow(state => ({
      titleData: state.titleData,
      setTitleData: state.setTitleData,
    }))
  );
  const bulkTitleData = titleData.isDefault ? TITLE_BULK_DATA : titleData;
  const handleTitleChange = (next: typeof bulkTitleData) => {
    if (
      next.font === bulkTitleData.font &&
      next.fontSize === bulkTitleData.fontSize &&
      next.fontWeight === bulkTitleData.fontWeight &&
      next.color.toUpperCase() === bulkTitleData.color.toUpperCase()
    ) {
      return;
    }
    setTitleData({ ...next, isDefault: false });
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <NavigationBar>제목 편집</NavigationBar>
        <TextEditorPreview
          value={bulkTitleData}
          onChange={handleTitleChange}
          colorPickerId="title"
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={onActiveColorPickerChange}
        >
          <div
            className={`w-full h-full flex flex-col gap-1  ${
              bulkTitleData.font.startsWith('var(--')
                ? bulkTitleData.font.slice(6, -1)
                : bulkTitleData.font
            }`}
          >
            <p
              className="sub-title text-center wrap-break-word"
              style={toStyle(bulkTitleData, true, true)}
            >
              ENG TITLE
            </p>

            <p
              className="main-title text-center wrap-break-word"
              style={toStyle(bulkTitleData, true)}
            >
              제목입니다
            </p>
          </div>
        </TextEditorPreview>
      </div>
    </div>
  );
}

export default TitleEdit;
