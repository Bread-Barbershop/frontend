'use client';

import React, { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditorPreview } from '@/components/molecules/preview-text-editor';
import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import { BODY_BULK_DATA } from '@/shared/data/sample/bulkData';
import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { BulkData } from '@/shared/types/block';
import { applyBulkBodyStyleToBlocks } from '@/shared/utils/applyBulkBodyStyle';
import { toStyle } from '@/shared/utils/toStyle';

type BodyEditProps = {
  activeColorPickerId: BulkColorPickerId | null;
  onActiveColorPickerChange: (id: BulkColorPickerId | null) => void;
};

function BodyEdit({
  activeColorPickerId,
  onActiveColorPickerChange,
}: BodyEditProps) {
  const { bodyData, block, setBlock, setBodyData } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      bodyData: state.bodyData,
      setBlock: state.setBlock,
      setBodyData: state.setBodyData,
    }))
  );

  const [bulkBodyData, setBulkBodyData] = useState<BulkData>(
    bodyData.isDefault ? BODY_BULK_DATA : bodyData
  );

  // const handleReset = () => {
  //   setBulkBodyData(BODY_BULK_DATA);
  //   setBodyData(BODY_BULK_DATA);
  //   setBlock(applyBulkBodyFontSizeToBlocks(block, BODY_BULK_DATA.fontSize));
  // };

  const handleApply = () => {
    setBodyData({ ...bulkBodyData, isDefault: false });
    setBlock(
      applyBulkBodyStyleToBlocks(block, {
        fontSize: bulkBodyData.fontSize,
        fontFamily: resolveFontFamily(bulkBodyData.font),
        fontWeight: bulkBodyData.fontWeight,
        color: bulkBodyData.color,
      })
    );
  };

  return (
    <div className="w-full">
      <NavigationBar
        action={
          <div className="flex items-center gap-1">
            {/* <UtilityButton size="md" variant="primary" onClick={handleReset}>
              되돌리기
            </UtilityButton> */}
            <UtilityButton size="md" variant="primary" onClick={handleApply}>
              적용하기
            </UtilityButton>
          </div>
        }
        direction="right"
      >
        본문 편집
      </NavigationBar>
      <TextEditorPreview
        value={bulkBodyData}
        onChange={setBulkBodyData}
        colorPickerId="body"
        activeColorPickerId={activeColorPickerId}
        onActiveColorPickerChange={onActiveColorPickerChange}
      >
        <div className="w-full h-full flex flex-col gap-1 px-3">
          <p
            className="font-base text-base text-center wrap-break-word"
            style={toStyle(bulkBodyData, false)}
          >
            Eng Sample
          </p>
          <p
            className="font-base text-base text-center wrap-break-word"
            style={toStyle(bulkBodyData, false)}
          >
            본문입니다
          </p>
        </div>
      </TextEditorPreview>
    </div>
  );
}

export default BodyEdit;
