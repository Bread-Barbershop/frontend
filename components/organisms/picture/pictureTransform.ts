type PictureTransform = {
  imageRotation?: unknown;
  imageScale?: unknown;
  imageRatio?: unknown;
  imageOffsetX?: unknown;
  imageOffsetY?: unknown;
  imageFilter?: unknown;
  imageBrightness?: unknown;
};

const clamp = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;

export function resolvePictureTransform(props: PictureTransform) {
  const rotation = clamp(props.imageRotation, 0, -360, 360);
  const scale = clamp(props.imageScale, 1, 1, 3);
  const x = clamp(props.imageOffsetX, 50, 0, 100);
  const y = clamp(props.imageOffsetY, 50, 0, 100);
  const brightness = clamp(props.imageBrightness, 100, 50, 150);
  const ratio = ['1/1', '4/3', '16/9'].includes(String(props.imageRatio))
    ? String(props.imageRatio)
    : '1/1';
  const preset: Record<string, string> = {
    none: '',
    grayscale: 'grayscale(1)',
    sepia: 'sepia(.65) saturate(.9)',
    contrast: 'contrast(1.2) saturate(1.1)',
    vignette: 'contrast(1.12) saturate(.8)',
  };
  const filter = preset[String(props.imageFilter)] ?? '';
  return {
    aspectRatio: ratio,
    transform: 'rotate(' + rotation + 'deg) scale(' + scale + ')',
    objectPosition: x + '% ' + y + '%',
    filter: [filter, 'brightness(' + brightness + '%)'].filter(Boolean).join(' '),
  };
}
