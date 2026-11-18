'use client';

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
  const bodyData = useEditorStore(state => state.bodyData);

  const bulkBodyData = bodyData.isDefault ? BODY_BULK_DATA : bodyData;

  const handleBodyChange = (next: BulkData) => {
    useEditorStore.setState(state => {
      const bodyData = { ...next, isDefault: false };
      return {
        bodyData,
        block: applyBulkBodyStyleToBlocks(state.block, {
          fontSize: bodyData.fontSize,
          fontFamily: resolveFontFamily(bodyData.font),
          fontWeight: bodyData.fontWeight,
          color: bodyData.color,
        }),
      };
    });
  };

  return (
    <div className="w-full">
      <NavigationBar>본문 편집</NavigationBar>
      <TextEditorPreview
        value={bulkBodyData}
        onChange={handleBodyChange}
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
