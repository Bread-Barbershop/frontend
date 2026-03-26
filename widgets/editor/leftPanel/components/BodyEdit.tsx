'use client';
import React, { useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditorPreview } from '@/components/molecules/preview-text-editor';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { BulkData } from '@/shared/types/block';

const BULK_DATA_INITIAL_VALUE: BulkData = {
  font: '',
  fontSize: '14px',
  color: '#000000',
  bold: false,
  italic: false,
  underline: false,
  align: 'center',
  isDefault: true,
};

function BodyEdit() {
  const { setBodyData } = useEditorStore();

  const [bulkBodyData, setBulkBodyData] = useState<BulkData>(
    BULK_DATA_INITIAL_VALUE
  );
  const toStyle = (data: BulkData, isEng?: boolean): React.CSSProperties => ({
    fontSize: isEng ? '13px' : data.fontSize,
    // fontFamily: data.fontFamily === 'default' ? undefined : data.fontFamily,
    fontWeight: data.bold ? '700' : '400',
    fontStyle: data.italic ? 'italic' : 'normal',
    textDecoration: data.underline ? 'underline' : 'none',
    color: data.color,
  });
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
        <div
          className={`w-full h-full flex flex-col gap-1 ${bulkBodyData.align === 'left' ? 'items-start' : bulkBodyData.align === 'center' ? 'items-center' : 'items-end'}`}
        >
          <p className="font-base text-base" style={toStyle(bulkBodyData)}>
            본문입니다.
          </p>
        </div>
      </TextEditorPreview>
    </div>
  );
}

export default BodyEdit;
