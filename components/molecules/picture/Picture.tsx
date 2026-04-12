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
  value?: (File | string)[];
  label: string;
  labelClassName?: string;
  multiple?: boolean;
  onChange?: (files: (File | string)[]) => void;
  onReorder?: (files: (File | string)[]) => void;
  onDelete?: (files: (File | string)[]) => void;
  className?: string;
  previewClassName?: string;
  inputClassName?: string;
}

export const Picture = ({
  value,
  label = '사진',
  labelClassName,
  multiple,
  onChange,
  onReorder,
  onDelete,
  className,
  previewClassName,
  inputClassName,
}: PictureProps) => {
  const [preview, setPreview] = useState<
    { id: string; src: string; file: File | string }[]
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

      if (typeof file === 'string') {
        return {
          id: crypto.randomUUID(),
          src: file,
          file,
        };
      }

      return {
        id: crypto.randomUUID(),
        src: URL.createObjectURL(file), // 새 파일이면 URL 생성
        file,
      };
    });

    // 2. 삭제된 파일의 URL 해제 (메모리 누수 방지)
    const newValueSet = new Set(value ?? []);
    prev.forEach(item => {
      if (!newValueSet.has(item.file)) {
        if (typeof item.file !== 'string') {
          URL.revokeObjectURL(item.src);
        }
      }
    });

    setPreview(newPreview);
  }, [value]);

  // 컴포넌트 언마운트 시 모든 URL 해제
  useEffect(() => {
    return () => {
      previewRef.current.forEach(item => {
        if (typeof item.file !== 'string') {
          URL.revokeObjectURL(item.src);
        }
      });
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (onChange) {
      onChange(files);
    }
    // 인풋값을 초기화하여 의도치 않은 중복 트리거를 방지하고,
    // 동일한 파일을 다시 선택했을 때도 이벤트가 발생하도록 합니다.
    e.target.value = '';
  };

  const handleMove = (
    items: { id: string; src: string; file: File | string }[]
  ) => {
    setPreview(items);
    const files = items.map(item => item.file);
    if (onReorder) {
      onReorder(files);
    } else if (onChange) {
      onChange(files);
    }
  };

  const handleRemove = (src: string) => {
    if (!value || !onDelete) return;
    const target = preview.find(p => p.src === src);
    if (!target) return;

    const updatedFiles = value.filter(file => file !== target.file);
    onDelete(updatedFiles);
  };
  return (
    <div className={cn(pictureVariants(), className)}>
      <Label className={cn('font-semibold shrink-0', labelClassName)}>
        {label}
      </Label>
      <SortableWrapper
        items={preview}
        onChange={(items, e) => {
          e?.stopPropagation();
          handleMove(items);
        }}
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
