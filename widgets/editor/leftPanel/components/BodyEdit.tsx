'use client';
import React, { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditorPreview } from '@/components/molecules/preview-text-editor';
import { BODY_BULK_DATA } from '@/shared/data/sample/bulkData';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { BulkData } from '@/shared/types/block';
import { toStyle } from '@/shared/utils/toStyle';

function BodyEdit() {
  const { bodyData, setBodyData } = useEditorStore(
    useShallow(state => ({
      bodyData: state.bodyData,
      setBodyData: state.setBodyData,
    }))
  );

  const [bulkBodyData, setBulkBodyData] = useState<BulkData>(
    bodyData.isDefault ? BODY_BULK_DATA : bodyData
  );

  return (
    <div className="w-full">
      <NavigationBar
        action={
          <UtilityButton
            size="md"
            variant="primary"
            onClick={() => {
              setBodyData({ ...bulkBodyData, isDefault: false });
            }}
          >
            적용하기
          </UtilityButton>
        }
        direction="right"
      >
        본문 편집
      </NavigationBar>
      <TextEditorPreview value={bulkBodyData} onChange={setBulkBodyData}>
        <div className="w-full h-full flex flex-col gap-1 ">
          <p
            className="font-base text-base"
            style={toStyle(bulkBodyData, false)}
          >
            본문입니다.
          </p>
        </div>
      </TextEditorPreview>
    </div>
  );
}

export default BodyEdit;
