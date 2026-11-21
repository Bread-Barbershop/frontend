'use client';

import { useEffect, useId, useRef, useState } from 'react';
import ReactCrop, { convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { centeredPhotoCrop } from './photoCrop';

import type { PercentCrop, PixelCrop } from 'react-image-crop';

type ApplyCrop = (
  image: HTMLImageElement,
  rect: PixelCrop
) => void | Promise<void>;

interface Props {
  src: string;
  onApply: ApplyCrop;
  onClose: () => void;
}

const ratios = [
  { label: '자유', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
];
const button =
  'rounded-md border border-border-divider px-3 py-2 text-sm font-medium disabled:opacity-50';

export function PhotoCropDialog({ src, onApply, onClose }: Props) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const submitting = useRef(false);
  const [aspect, setAspect] = useState<number>();
  const [crop, setCrop] = useState<PercentCrop>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);

  function selectRatio(value?: number) {
    const img = image.current;
    if (!img?.naturalWidth) return;
    setAspect(value);
    if (value)
      setCrop(centeredPhotoCrop(img.naturalWidth, img.naturalHeight, value));
  }

  async function apply() {
    const img = image.current;
    if (!img || !crop?.width || !crop.height || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const rect = convertToPixelCrop(
        crop,
        img.naturalWidth,
        img.naturalHeight
      );
      await onApply(img, rect);
      onClose();
    } catch {
      setError('사진을 적용하지 못했어요. 다시 시도해 주세요.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,640px)] overflow-auto rounded-xl bg-white p-4 text-left text-text-primary shadow-xl backdrop:bg-black/50 sm:p-6"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      onCancel={e => {
        e.preventDefault();
        if (!submitting.current) onClose();
      }}
    >
      <h2 id={titleId} className="mb-3 text-lg font-semibold">
        사진 자르기
      </h2>
      <div
        className="mb-3 flex flex-wrap gap-1.5"
        role="group"
        aria-label="자르기 비율"
      >
        {ratios.map(option => (
          <button
            key={option.label}
            type="button"
            disabled={!crop || busy}
            aria-pressed={aspect === option.value}
            className={
              button + ' aria-pressed:bg-text-primary aria-pressed:text-white'
            }
            onClick={() => selectRatio(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="flex justify-center rounded-lg bg-bg-sub p-2">
        <ReactCrop
          className="max-h-[45dvh]"
          crop={crop}
          aspect={aspect}
          onChange={(_, percent) => setCrop(percent)}
          disabled={busy}
          keepSelection
          ariaLabels={{
            cropArea: '자를 영역',
            nwDragHandle: '왼쪽 위',
            nDragHandle: '위',
            neDragHandle: '오른쪽 위',
            eDragHandle: '오른쪽',
            seDragHandle: '오른쪽 아래',
            sDragHandle: '아래',
            swDragHandle: '왼쪽 아래',
            wDragHandle: '왼쪽',
          }}
        >
          {/* The crop coordinates refer to this exact decoded image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={image}
            src={src}
            alt="자를 사진"
            crossOrigin="anonymous"
            draggable={false}
            className="block max-h-[45dvh] max-w-full"
            onLoad={e => {
              const img = e.currentTarget;
              setCrop(
                centeredPhotoCrop(img.naturalWidth, img.naturalHeight, aspect)
              );
            }}
            onError={() =>
              setError('사진을 불러오지 못했어요. 파일을 다시 선택해 주세요.')
            }
          />
        </ReactCrop>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className={button}
          disabled={busy}
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="button"
          className={button + ' bg-text-primary text-white'}
          disabled={!crop?.width || !crop.height || busy}
          onClick={() => void apply()}
        >
          자르기 적용
        </button>
      </div>
    </dialog>
  );
}
