'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label';
import { PictureInput } from '@/components/atoms/picture/PictureInput';
import { PictureLoadingSkeleton } from '@/components/atoms/picture/PictureLoadingSkeleton';
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
  onDelete?: (files?: (File | string)[]) => void;
  className?: string;
  previewClassName?: string;
  inputClassName?: string;
  /** 이미지 압축 등 비동기 처리 중인 파일 개수. 개수만큼 스켈레톤을 보여주고 입력을 비활성화한다. */
  loadingCount?: number;
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
  loadingCount = 0,
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
    // 같은 파일이 여러 번 추가될 때 각각 고유한 id를 생성하기 위해
    // 파일 참조 + 인덱스 조합으로 id를 생성
    const newPreview = (value ?? []).map((file, index) => {
      const existing = prev.find(p => p.file === file);

      // 이미 존재하는 파일이면 기존 데이터 재사용하되,
      // 인덱스를 포함한 고유한 id 생성 (중복 방지)
      if (existing) {
        return {
          id: `${file.toString()}-${index}`,
          src: existing.src,
          file,
        };
      }

      if (typeof file === 'string') {
        return {
          id: `${file}-${index}`,
          src: file,
          file,
        };
      }

      return {
        id: `${(file as File).name}-${(file as File).size}-${(file as File).lastModified}-${index}`,
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
          <>
            {Array.from({ length: loadingCount }).map((_, index) => (
              <li key={`picture-loading-${index}`}>
                <PictureLoadingSkeleton className={previewClassName} />
              </li>
            ))}
            {(multiple || preview.length === 0) && loadingCount === 0 && (
              <li>
                <PictureInput
                  multiple={multiple}
                  className={inputClassName}
                  onChange={handleChange}
                />
              </li>
            )}
          </>
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
