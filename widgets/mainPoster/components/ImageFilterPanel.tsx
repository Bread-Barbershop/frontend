import * as fabric from 'fabric';
import React from 'react';

import { ImageEditor } from '@/components/molecules/image-editor';

import { PhotoPresetOptions } from '../types/fabric';

interface Props {
  canvas: fabric.Canvas | null;
  applyImageFilter: (
    options: PhotoPresetOptions,
    canvas: fabric.Canvas
  ) => void;
  currentFilters?: PhotoPresetOptions;
  isCropping: boolean;
  startCrop: (canvas: fabric.Canvas) => void;
  applyCrop: (canvas: fabric.Canvas) => void;
  cancelCrop: (canvas: fabric.Canvas) => void;
}

// 9가지 필터 항목 설정
const FILTER_CONFIG: {
  key: keyof PhotoPresetOptions;
  label: string;
  min: number;
  max: number;
  default: number;
}[] = [
  { key: 'exposure', label: '노출 (Exposure)', min: 0, max: 100, default: 50 },
  { key: 'contrast', label: '대비 (Contrast)', min: 0, max: 100, default: 50 },
  {
    key: 'saturation',
    label: '채도 (Saturation)',
    min: 0,
    max: 100,
    default: 50,
  },
  { key: 'temperature', label: '색온도 (Temp)', min: 0, max: 100, default: 50 },
  { key: 'tint', label: '색조 (Tint)', min: 0, max: 100, default: 50 },
  { key: 'fade', label: '페이드 (Fade)', min: 0, max: 100, default: 0 },
  { key: 'vignette', label: '비네팅 (Vignette)', min: 0, max: 100, default: 0 },
  { key: 'grain', label: '노이즈 (Grain)', min: 0, max: 100, default: 0 },
  { key: 'bw', label: '흑백 강도 (B&W)', min: 0, max: 100, default: 0 },
] as const;

const ImageFilterPanel: React.FC<Props> = ({
  canvas,
  applyImageFilter,
  currentFilters,
  isCropping,
  startCrop,
  applyCrop,
  cancelCrop,
}) => {
  if (!canvas) return null;

  const handleChange = (key: keyof PhotoPresetOptions, value: number) => {
    const newOptions = { ...currentFilters, [key]: value };
    applyImageFilter(newOptions, canvas);
  };

  const handleApply = (options: PhotoPresetOptions) => {
    applyImageFilter(options, canvas);
  };

  const handleStartCrop = () => {
    startCrop(canvas);
  };

  const handleApplyCrop = () => {
    applyCrop(canvas);
  };

  const handleCancelCrop = () => {
    cancelCrop(canvas);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl bg-gray-500 p-2">
      {/* 크롭 및 필터 프리셋 섹션 */}
      <div className="flex flex-wrap gap-2 items-center">
        {!isCropping ? (
          <button
            onClick={handleStartCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            크롭
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleApplyCrop}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
            >
              크롭 적용
            </button>
            <button
              onClick={handleCancelCrop}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              취소
            </button>
          </div>
        )}
        <div className="h-6 w-px bg-gray-400 mx-2" />
        {/* 프리셋 선택 섹션 (ImageEditor 내부의 프리셋 버튼들) */}
        <div className="flex flex-wrap gap-2">
          <ImageEditor onApply={handleApply} />
        </div>
      </div>

      {/* 슬라이더 컨트롤 패널 */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          {FILTER_CONFIG.map(filter => (
            <div key={filter.key} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-600">
                  {filter.label}
                </label>
                <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-1.5 rounded">
                  {currentFilters?.[filter.key] ?? filter.default}
                </span>
              </div>
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                step="1"
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
                value={currentFilters?.[filter.key] ?? filter.default}
                onChange={e => handleChange(filter.key, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageFilterPanel;
