'use client';

import { useRef } from 'react';

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: (src: string, width: number, height: number) => void;
}

export const Toolbar = ({ onAddText, onAddImage }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // 이미지 크기 제한 (최대 400px)
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          onAddImage(img.src, width, height);
        };
      };
      reader.readAsDataURL(file);
    }
    // 입력 초기화 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2 p-4 bg-gray-100 border-b border-gray-300">
      <button
        onClick={onAddText}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        텍스트 추가
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        이미지 업로드
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

