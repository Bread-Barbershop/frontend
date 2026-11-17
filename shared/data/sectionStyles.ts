export const SECTION_STYLE_OPTIONS = [
  { value: 'plain', label: '기본' },
  { value: 'paper', label: '종이 카드' },
  { value: 'rounded', label: '라운드 카드' },
  { value: 'outlined', label: '테두리 카드' },
] as const;

export type SectionStyle = (typeof SECTION_STYLE_OPTIONS)[number]['value'];

export function resolveSectionStyle(value: unknown): SectionStyle | undefined {
  return SECTION_STYLE_OPTIONS.find(option => option.value === value)?.value;
}

export function supportsSectionStyle(component: string) {
  return !['spacer', 'divider', 'bgm', 'visualEffects', 'shareUrl'].includes(
    component
  );
}
