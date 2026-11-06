const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function normalizeDressCodeColors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string' && HEX_COLOR.test(item))
    .slice(0, 8);
}

export function normalizeDressCodeGuidelines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.slice(0, 140))
    .slice(0, 8);
}
