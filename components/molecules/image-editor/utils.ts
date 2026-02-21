import { PhotoPresetOptions } from './types';

export const convertFabricToCssFilter = (
  options: PhotoPresetOptions
): string => {
  if (!options) return '';

  const {
    exposure = 0,
    contrast = 0,
    saturation = 0,
    // temperature = 0, // CSS filter does not support temperature directly usually requires SVG filter or sepia/hue-rotate approx
    // tint = 0,        // CSS filter does not support tint directly
    // fade = 0,        // CSS filter does not support fade directly (opacity?)
    // vignette = 0,    // CSS filter does not support vignette directly (box-shadow or overlay)
    // grain = 0,       // CSS filter does not support grain directly (noise image overlay)
    bw = 0,
  } = options;

  const filters: string[] = [];

  // Exposure: -100 to 100 -> brightness 0 to 2
  // 0 -> 1 (original)
  if (exposure !== 0) {
    // exposure 50 -> 1.5 brightness? Fabric brightness is -1 to 1.
    // Let's assume input range is roughly -100 to 100 based on presets (e.g., 50, 65).
    // Fabric uses filters.Brightness({ brightness: 0.05 }) for example.
    // If preset value 50 means something specific in Fabric logic, I need to know the mapping.
    // Assuming preset values are normalized 0-100 or -100 to 100.
    // Looking at constant.ts: exposure: 50, contrast: 50.
    // If these are "neutral" values, then 50 might be 1 (100%).
    // But constant.ts says "none" has exposure 50, contrast 50, saturation 50.
    // So 50 is the baseline (no effect).

    // Brightness: 50 -> 100% (1), 0 -> 0%, 100 -> 200% (2)
    const brightnessVal = (exposure / 50) * 100;
    filters.push(`brightness(${brightnessVal}%)`);
  }

  // Contrast: 50 -> 100% (1)
  if (contrast !== 0) {
    const contrastVal = (contrast / 50) * 100;
    filters.push(`contrast(${contrastVal}%)`);
  }

  // Saturation: 50 -> 100% (1)
  if (saturation !== 0) {
    const saturateVal = (saturation / 50) * 100;
    filters.push(`saturate(${saturateVal}%)`);
  }

  // Black & White (Grayscale): 0 -> 0%, 100 -> 100%
  // In presets, bw is 0 or 100.
  if (bw !== 0) {
    // Assuming bw is 0-100
    filters.push(`grayscale(${bw}%)`);
  }

  // Temperature, Tint, Fade, Vignette, Grain are complex to map directly to CSS one-liners without SVG or complex overlays.
  // For now, mapping basic brightness/contrast/saturation/grayscale is a good start.
  // SEP_NOTE: Revisit if advanced CSS filters (sepia, hue-rotate for temp/tint) are needed.

  return filters.join(' ');
};
