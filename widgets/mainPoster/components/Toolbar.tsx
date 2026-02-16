import * as fabric from 'fabric';
import React, { useRef } from 'react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/atoms/button';
import { useEditorStore } from '@/widgets/editor/store/useEditorStore';

interface Props {
  canvas: fabric.Canvas | null;
  handleDrawingMode: () => void;
  addImage: (url: string, canvas: fabric.Canvas) => void;
}

function Toolbar({ canvas, handleDrawingMode, addImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeTab, setActiveTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
    }))
  );

  if (!canvas) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        addImage(result, canvas);
      }
    };
    reader.readAsDataURL(file);

    // 같은 파일을 다시 올릴 수 있도록 초기화
    e.target.value = '';
  };

  return (
    <div className="absolute top-1/2 -left-[60px] -translate-x-full flex flex-col gap-3">
      <Button onClick={handleDrawingMode}>텍스트</Button>
      <Button
        onClick={() => {
          setActiveTab('image');
        }}
        variant="bordered"
        className={activeTab === 'image' ? 'bg-blue-100 border-blue-500' : ''}
      >
        사진
      </Button>
      {/*  */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
export default Toolbar;
