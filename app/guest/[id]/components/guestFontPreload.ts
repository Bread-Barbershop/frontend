import {
  getFontFamilies,
  resolveFontFamily,
} from '@/shared/fonts/fontRegistry';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

type GuestRendererBlock = NormalizedGuestPayload['blocks'][number];
type GuestRendererBulkData = NormalizedGuestPayload['bulkData'];
type GuestRendererRenderHints = NormalizedGuestPayload['renderHints'];

const FONT_FAMILY_SET = new Set(getFontFamilies().map(font => font.family));

function extractFontFamiliesFromString(value: string) {
  const families = new Set<string>();
  const normalizedValue = value.replace(/&quot;/g, '"');

  const fontFamilyRegex = /font-family\s*:\s*([^;"'}]+)/gi;

  for (const match of normalizedValue.matchAll(fontFamilyRegex)) {
    const rawFamilies = match[1]?.split(',') ?? [];

    rawFamilies.forEach(rawFamily => {
      const normalizedFamily = resolveFontFamily(
        rawFamily.trim().replace(/^['"]|['"]$/g, '')
      );

      if (FONT_FAMILY_SET.has(normalizedFamily)) {
        families.add(normalizedFamily);
      }
    });
  }

  FONT_FAMILY_SET.forEach(fontFamily => {
    if (normalizedValue.includes(fontFamily)) {
      families.add(fontFamily);
    }
  });

  return families;
}

function collectGuestFontFamilies(
  value: unknown,
  families = new Set<string>()
) {
  if (typeof value === 'string') {
    extractFontFamiliesFromString(value).forEach(fontFamily => {
      families.add(fontFamily);
    });

    const resolvedFamily = resolveFontFamily(value);
    if (FONT_FAMILY_SET.has(resolvedFamily)) {
      families.add(resolvedFamily);
    }

    return families;
  }

  if (Array.isArray(value)) {
    value.forEach(item => {
      collectGuestFontFamilies(item, families);
    });

    return families;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => {
      collectGuestFontFamilies(item, families);
    });
  }

  return families;
}

export function resolveGuestFontFamiliesToPreload(params: {
  blocks: GuestRendererBlock[];
  bulkData: GuestRendererBulkData;
  renderHints?: GuestRendererRenderHints;
}) {
  const { blocks, bulkData, renderHints } = params;
  const { titleData, bodyData } = bulkData;
  const families = new Set<string>();

  // 새로 저장된 초대장은 renderHints.fonts를 우선 사용해 재귀 탐색 비용을 피한다.
  renderHints?.fonts.forEach(fontFamily => {
    const resolvedFamily = resolveFontFamily(fontFamily);
    if (FONT_FAMILY_SET.has(resolvedFamily)) {
      families.add(resolvedFamily);
    }
  });

  // 기존 초대장처럼 hints가 없는 경우에는 기존 방식으로 blocks를 훑는다.
  if (families.size === 0) {
    collectGuestFontFamilies(
      {
        blocks,
        titleData,
        bodyData,
      },
      families
    );
  }

  // 전체 스타일 기본값인 bulkData 폰트는 hints 유무와 관계없이 항상 포함한다.
  families.add(resolveFontFamily(titleData.font));
  families.add(resolveFontFamily(bodyData.font));

  return Array.from(families);
}
