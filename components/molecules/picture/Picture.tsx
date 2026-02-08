'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label';
import { PictureInput } from '@/components/atoms/picture/PictureInput';
import { PicturePreview } from '@/components/atoms/picture/PicturePreview';
import SortableItem from '@/features/DndKit/Sort/SortableItem';
import SortableWrapper from '@/features/DndKit/Sort/SortableWrapper';
import { cn } from '@/shared/utils/cn';

interface PictureProps {
  value?: File[];
  label: string;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  className?: string;
}

export const Picture = ({
  value,
  label = '사진',
  multiple,
  onChange,
  className,
}: PictureProps) => {
  const [preview, setPreview] = useState<
    { id: string; src: string; file: File }[]
  >([]);

  /* 
    previewRef: 
    useEffect 내부에서 상태(preview)를 참조하면 의존성 배열에 추가해야 하고, 
    그러면 무한 루프에 빠질 수 있습니다.
    최신 preview 상태를 참조만 하기 위해 ref를 사용합니다.
  */
  const previewRef = useRef(preview);

  // 매 렌더링마다 ref 동기화
  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  useEffect(() => {
    const prev = previewRef.current;

    // 1. 새로운 상태 계산 (기존 아이템 재사용)
    const newPreview = (value ?? []).map(file => {
      const existing = prev.find(p => p.file === file);
      if (existing) {
        return existing;
      }
      return {
        id: crypto.randomUUID(),
        src: URL.createObjectURL(file), // 새 파일이면 URL 생성
        file,
      };
    });

    // 2. 삭제된 파일의 URL 해제 (메모리 누수 방지)
    const newFileSet = new Set(value ?? []);
    prev.forEach(item => {
      if (!newFileSet.has(item.file)) {
        URL.revokeObjectURL(item.src);
      }
    });

    setPreview(newPreview);
  }, [value]);

  // 컴포넌트 언마운트 시 모든 URL 해제
  useEffect(() => {
    return () => {
      previewRef.current.forEach(item => URL.revokeObjectURL(item.src));
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files) return;
    if (onChange) {
      onChange(files);
    }
  };
  const handleMove = (items: { id: string; src: string; file: File }[]) => {
    setPreview(items);
    const files = items.map(item => item.file);
    if (onChange) {
      onChange(files);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label className="font-semibold shrink-0">{label}</Label>
      <div className="flex-center flex-wrap">
        {
          preview.length > 0 && (
            <SortableWrapper
              items={preview}
              onChange={items => handleMove(items)}
              className="flex-row gap-0"
            >
              {item => (
                <SortableItem id={item.id} key={item.id}>
                  <PicturePreview src={item.src} className={className} />
                </SortableItem>
              )}
            </SortableWrapper>
          )
          // preview.map(pictureScr => {
          //   const id = crypto.randomUUID();
          //   return (
          //     <PicturePreview src={pictureScr} key={id} className={className} />
          //   );
          // })
        }
        {(multiple || preview.length === 0) && (
          <PictureInput
            onChange={e => handleChange(e)}
            multiple={multiple}
            className={className}
          />
        )}
      </div>
    </div>
  );
};
Picture.displayName = 'Picture';
