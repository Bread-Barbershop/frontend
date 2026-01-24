import * as fabric from 'fabric';
import React, { useRef } from 'react';

interface Props {
  canvas: fabric.Canvas | null;
  handleDrawingMode: () => void;
  addImage: (url: string, canvas: fabric.Canvas) => void;
}

function Toolbar({ canvas, handleDrawingMode, addImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    reader.onload = (event) => {
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
    <div className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <button
        onClick={handleDrawingMode}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        텍스트 추가
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        이미지 업로드
      </button>

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
