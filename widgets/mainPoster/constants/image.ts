import { PhotoPresetOptions } from '../types/fabric';

export const FILTER_CONFIG: {
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

export const ASPECT_RATIO_OPTIONS = [
  { label: '자유', value: 'free' },
  { label: '1:1', value: (1 / 1).toFixed(2) },
  { label: '4:3', value: (4 / 3).toFixed(2) },
  { label: '3:4', value: (3 / 4).toFixed(2) },
  { label: '9:16', value: (9 / 16).toFixed(2) },
] as const;
