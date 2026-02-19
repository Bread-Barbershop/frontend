'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label';
import { PictureInput } from '@/components/atoms/picture/PictureInput';
import { PicturePreview } from '@/components/atoms/picture/PicturePreview';
import SortableItem from '@/features/DndKit/Sort/SortableItem';
import SortableWrapper from '@/features/DndKit/Sort/SortableWrapper';
import { cn } from '@/shared/utils/cn';

import { pictureVariants } from './Picture.style';

interface PictureProps {
  value?: File[];
  label: string;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  className?: string;
  previewClassName?: string;
  inputClassName?: string;
}

export const Picture = ({
  value,
  label = '사진',
  multiple,
  onChange,
  className,
  previewClassName,
  inputClassName,
}: PictureProps) => {
  const [preview, setPreview] = useState<
    { id: string; src: string; file: File }[]
  >([]);

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

  const handleRemove = (src: string) => {
    if (!value || !onChange) return;
    const target = preview.find(p => p.src === src);
    if (!target) return;

    const updatedFiles = value.filter(file => file !== target.file);
    onChange(updatedFiles);
  };
  return (
    <div className={cn(pictureVariants(), className)}>
      <Label className="font-semibold shrink-0">{label}</Label>
      <SortableWrapper
        items={preview}
        onChange={items => handleMove(items)}
        className="flex-row flex-wrap gap-2"
        suffix={
          (multiple || preview.length === 0) && (
            <li>
              <PictureInput
                multiple={multiple}
                className={inputClassName}
                onChange={handleChange}
              />
            </li>
          )
        }
      >
        {item => (
          <SortableItem id={item.id} key={item.id}>
            <PicturePreview
              src={item.src}
              className={previewClassName}
              onDelete={handleRemove}
            />
          </SortableItem>
        )}
      </SortableWrapper>
    </div>
  );
};
Picture.displayName = 'Picture';
