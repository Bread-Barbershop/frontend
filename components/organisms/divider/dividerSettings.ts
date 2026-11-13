const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;

export function normalizeDividerSettings(value: {
  height?: unknown;
  thickness?: unknown;
  color?: unknown;
  topSpacing?: unknown;
  bottomSpacing?: unknown;
}) {
  return {
    height: clamp(value.height, 32, 96, 64),
    thickness: clamp(value.thickness, 1, 2, 1),
    color:
      typeof value.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(value.color)
        ? value.color
        : '#E2E8F0',
    topSpacing: clamp(value.topSpacing, 0, 64, 12),
    bottomSpacing: clamp(value.bottomSpacing, 0, 64, 12),
  };
}
