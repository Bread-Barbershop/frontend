'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label';
import { PictureInput } from '@/components/atoms/picture/PictureInput';
import { PictureLoadingSkeleton } from '@/components/atoms/picture/PictureLoadingSkeleton';
import { PicturePreview } from '@/components/atoms/picture/PicturePreview';
import SortableItem from '@/features/DndKit/Sort/SortableItem';
import SortableWrapper from '@/features/DndKit/Sort/SortableWrapper';
import { useDriveImageResolveContext } from '@/shared/hooks/useDriveImageResolveMode';
import { cn } from '@/shared/utils/cn';
import { resolveDriveImageSource } from '@/shared/utils/media/driveImageUtils';

import { croppedPhotoFile } from './photoCrop';
import { PhotoCropDialog } from './PhotoCropDialog';
import { pictureVariants } from './Picture.style';

interface PictureProps {
  value?: (File | string)[];
  label: string;
  labelClassName?: string;
  multiple?: boolean;
  onChange?: (files: (File | string)[]) => void;
  onUpdateFiles?: (files: (File | string)[]) => void;
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
  onUpdateFiles,
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
  const nextId = useRef(0);
  const [cropId, setCropId] = useState<string | null>(null);
  const cropTarget = preview.find(item => item.id === cropId);
  const updateFiles = onUpdateFiles ?? onChange;
  const { folderId, mode } = useDriveImageResolveContext();

  useEffect(() => {
    const remaining = [...previewRef.current];
    const newPreview = (value ?? []).map(file => {
      const index = remaining.findIndex(item => item.file === file);
      const existing = index < 0 ? undefined : remaining.splice(index, 1)[0];
      const src =
        typeof file === 'string'
          ? resolveDriveImageSource(file, { folderId, mode })
          : (existing?.src ?? URL.createObjectURL(file));
      return { id: existing?.id ?? String(++nextId.current), file, src };
    });

    remaining.forEach(item => {
      if (typeof item.file !== 'string') URL.revokeObjectURL(item.src);
    });

    previewRef.current = newPreview;
    setPreview(newPreview);
  }, [value, folderId, mode]);

  // 컴포넌트 언마운트 시 모든 URL 해제
  useEffect(() => {
    return () => {
      previewRef.current.forEach(item => {
        if (typeof item.file !== 'string') {
          URL.revokeObjectURL(item.src);
        }
      });
      previewRef.current = [];
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
    previewRef.current = items;
    setPreview(items);
    const files = items.map(item => item.file);
    updateFiles?.(files);
  };

  const handleRemove = (id: string) => {
    if (!value || !onDelete) return;
    const updatedFiles = preview
      .filter(item => item.id !== id)
      .map(item => item.file);
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
              onDelete={() => handleRemove(item.id)}
              onCrop={
                loadingCount === 0 && updateFiles
                  ? () => setCropId(item.id)
                  : undefined
              }
            />
          </SortableItem>
        )}
      </SortableWrapper>
      {cropTarget && (
        <PhotoCropDialog
          key={cropTarget.id}
          src={cropTarget.src}
          onClose={() => setCropId(null)}
          onApply={async (image, rect) => {
            const name =
              cropTarget.file instanceof File ? cropTarget.file.name : 'photo';
            const file = await croppedPhotoFile(image, rect, name);
            const current = previewRef.current;
            if (!current.some(item => item.id === cropTarget.id)) return;
            const files = current.map(item =>
              item.id === cropTarget.id ? file : item.file
            );
            await updateFiles?.(files);
          }}
        />
      )}
    </div>
  );
};
Picture.displayName = 'Picture';
