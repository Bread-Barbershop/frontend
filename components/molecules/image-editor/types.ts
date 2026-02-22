export interface PhotoPresetOptions {
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  fade?: number;
  vignette?: number;
  grain?: number;
  bw?: number;
  type?: FilterType;
}

export type FilterType =
  | 'bw'
  | 'warm'
  | 'cool'
  | 'fade'
  | 'filmGrain'
  | 'vignette'
  | null;
