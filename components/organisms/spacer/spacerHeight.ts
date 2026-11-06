export const clampSpacerHeight = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 48;
  return Math.min(120, Math.max(16, Math.round(value)));
};
