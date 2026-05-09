import React from 'react';
import { useShallow } from 'zustand/shallow';

import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

function ZoomEdit() {
  const { isZoom, setIsZoom } = useEditorStore(
    useShallow(state => ({
      isZoom: state.isZoom,
      setIsZoom: state.setIsZoom,
    }))
  );
  const handleZoomInChange = () => {
    setIsZoom(!isZoom);
  };
  return (
    <div className="w-full flex items-center gap-2 pt-5">
      <Label className="font-semibold shrink-0 text-center">추가 기능</Label>
      <div>
        <Checkbox onChange={handleZoomInChange} checked={isZoom}>
          초대장 확대 방지
        </Checkbox>
      </div>
    </div>
  );
}

export default ZoomEdit;
