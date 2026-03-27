'use client';

import React, { ChangeEvent, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditorPreview } from '@/components/molecules/preview-text-editor';
import { TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { BulkData } from '@/shared/types/block';
import { toStyle } from '@/shared/utils/toStyle';

function TitleEdit() {
  const { titleData, isEngTitle, setTitleData, setEngTitle } = useEditorStore(
    useShallow(state => ({
      titleData: state.titleData,
      isEngTitle: state.isEngTitle,
      setTitleData: state.setTitleData,
      setEngTitle: state.setEngTitle,
    }))
  );
  const [bulkTitleData, setBulkTitleData] = useState<BulkData>(
    titleData.isDefault ? TITLE_BULK_DATA : titleData
  );
  const [bulkIsEngTitle, setBulkIsEngTitle] = useState(
    titleData.isDefault ? true : isEngTitle
  );

  const handleEngTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setBulkIsEngTitle(e.target.checked);
  };

  return (
    <div>
      <div className="w-full">
        <NavigationBar
          action={
            <UtilityButton
              size="md"
              variant="primary"
              onClick={() => {
                setTitleData({ ...bulkTitleData, isDefault: false });
                setEngTitle(bulkIsEngTitle);
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
            className={`w-full h-full flex flex-col gap-1 ${bulkTitleData.align === 'left' ? 'items-start' : bulkTitleData.align === 'center' ? 'items-center' : 'items-end'}`}
          >
            {bulkIsEngTitle && (
              <p
                className="sub-title"
                style={toStyle(bulkTitleData, true, true)}
              >
                ENG TITLE
              </p>
            )}
            <p className="main-title" style={toStyle(bulkTitleData, true)}>
              제목입니다.
            </p>
          </div>
        </TextEditorPreview>
      </div>
      <div className="flex gap-2 py-2 w-full">
        <Label className="font-semibold shrink-0">추가기능</Label>
        <Checkbox onChange={handleEngTitle} checked={bulkIsEngTitle}>
          영문 타이틀 추가
        </Checkbox>
      </div>
    </div>
  );
}

export default TitleEdit;
