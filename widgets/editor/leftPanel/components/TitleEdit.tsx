'use client';

import React, { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditorPreview } from '@/components/molecules/preview-text-editor';
import { TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { BulkData } from '@/shared/types/block';
import { toStyle } from '@/shared/utils/toStyle';

function TitleEdit() {
  const { titleData, setTitleData } = useEditorStore(
    useShallow(state => ({
      titleData: state.titleData,
      setTitleData: state.setTitleData,
    }))
  );
  const [bulkTitleData, setBulkTitleData] = useState<BulkData>(
    titleData.isDefault ? TITLE_BULK_DATA : titleData
  );

  return (
    <div className="w-full">
      <div className="w-full">
        <NavigationBar
          action={
            <UtilityButton
              size="md"
              variant="primary"
              onClick={() => {
                setTitleData({ ...bulkTitleData, isDefault: false });
              }}
            >
              적용하기
            </UtilityButton>
          }
          direction="right"
        >
          제목 편집
        </NavigationBar>
        <TextEditorPreview value={bulkTitleData} onChange={setBulkTitleData}>
          <div
            className={`w-full h-full flex flex-col gap-1 ${bulkTitleData.font}`}
          >
            <p className="sub-title" style={toStyle(bulkTitleData, true, true)}>
              ENG TITLE
            </p>

            <p className="main-title" style={toStyle(bulkTitleData, true)}>
              제목입니다.
            </p>
          </div>
        </TextEditorPreview>
      </div>
    </div>
  );
}

export default TitleEdit;
