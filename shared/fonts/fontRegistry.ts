import { CUSTOM_FONTS } from '@/shared/fonts/fonts';

export type AppFontFace = {
  family: string;
  weight: string;
  style: string;
  url: string;
};

export type AppFontFamily = {
  family: string;
  label: string;
  defaultWeight: string;
  fallback: string;
  faces: AppFontFace[];
};

const DEFAULT_FALLBACK_FAMILY = 'Pretendard';

const DEFAULT_WEIGHT_BY_FAMILY: Record<string, string> = {
  LINESeedKR: '400',
  Pretendard: '400',
  'Noto Sans KR': '400',
  Inter: '400',
  MaruBuri: '400',
};

const LEGACY_FONT_TOKEN_MAP: Record<string, string> = {
  'font-lineseed': 'LINESeedKR',
  'font-pretendard': 'Pretendard',
  'font-noto-kr': 'Noto Sans KR',
  'font-inter': 'Inter',
  'font-maruburi': 'MaruBuri',
};

const normalizeWeight = (weight: string) => String(weight);

const buildFontRegistry = () => {
  const familyMap = new Map<string, AppFontFamily>();

  CUSTOM_FONTS.forEach(font => {
    const existing = familyMap.get(font.family);
    const face = {
      family: font.family,
      weight: normalizeWeight(font.weight),
      style: font.style,
      url: font.url,
    };

    if (!existing) {
      familyMap.set(font.family, {
        family: font.family,
        label: font.family,
        defaultWeight:
          DEFAULT_WEIGHT_BY_FAMILY[font.family] ?? normalizeWeight(font.weight),
        fallback: DEFAULT_FALLBACK_FAMILY,
        faces: [face],
      });
      return;
    }

    existing.faces.push(face);
  });

  familyMap.forEach(entry => {
    entry.faces.sort((a, b) => Number(a.weight) - Number(b.weight));

    if (!entry.faces.some(face => face.weight === entry.defaultWeight)) {
      entry.defaultWeight =
        entry.faces.find(face => face.weight === '400')?.weight ??
        entry.faces[0]?.weight ??
        '400';
    }
  });

  return Array.from(familyMap.values());
};

export const FONT_REGISTRY = buildFontRegistry();

export const FONT_REGISTRY_MAP = new Map(
  FONT_REGISTRY.map(font => [font.family, font])
);

export const getFontFamily = (family: string) => {
  return FONT_REGISTRY_MAP.get(family);
};

export const getFontFamilies = () => FONT_REGISTRY;

export const getFontFaces = (family: string) => {
  return getFontFamily(family)?.faces ?? [];
};

export const getFontWeights = (family: string) => {
  return Array.from(
    new Set(getFontFaces(family).map(face => String(face.weight)))
  );
};

export const getDefaultFontWeight = (family: string) => {
  return getFontFamily(family)?.defaultWeight ?? '400';
};

export const resolveFontFamily = (value?: string | null) => {
  if (!value) return DEFAULT_FALLBACK_FAMILY;

  if (LEGACY_FONT_TOKEN_MAP[value]) {
    return LEGACY_FONT_TOKEN_MAP[value];
  }

  if (value.startsWith('var(--font-lineseed')) return 'LINESeedKR';
  if (value.startsWith('var(--font-pretendard')) return 'Pretendard';
  if (value.startsWith('var(--font-noto-kr')) return 'Noto Sans KR';
  if (value.startsWith('var(--font-inter')) return 'Inter';
  if (value.startsWith('var(--font-maruburi')) return 'MaruBuri';

  return value;
};

export const getFontFallbackStack = (family?: string | null) => {
  const resolvedFamily = resolveFontFamily(family);
  const fallback =
    getFontFamily(resolvedFamily)?.fallback ?? DEFAULT_FALLBACK_FAMILY;

  return `"${resolvedFamily}", "${fallback}", sans-serif`;
};
