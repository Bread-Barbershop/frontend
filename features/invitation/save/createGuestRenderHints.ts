import {
  getFontFamilies,
  resolveFontFamily,
} from '@/shared/fonts/fontRegistry';
import type { PersistedEditorBlock, ShareUrlState } from '@/shared/types/block';
import type { BulkJson, MainPosterData } from '@/shared/types/invitationSave';
import type { GuestRenderHints } from '@/shared/types/renderHints';
import { isDriveFileId } from '@/shared/utils/media/driveImageUtils';

const FONT_FAMILY_SET = new Set(getFontFamilies().map(font => font.family));
const ABOVE_THE_FOLD_BLOCK_COUNT = 2;

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

  const resolvedFamily = resolveFontFamily(value);
  if (FONT_FAMILY_SET.has(resolvedFamily)) {
    families.add(resolvedFamily);
  }

  return families;
}

function collectFontFamilies(value: unknown, families = new Set<string>()) {
  if (typeof value === 'string') {
    extractFontFamiliesFromString(value).forEach(fontFamily => {
      families.add(fontFamily);
    });

    return families;
  }

  if (Array.isArray(value)) {
    value.forEach(item => {
      collectFontFamilies(item, families);
    });

    return families;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => {
      collectFontFamilies(item, families);
    });
  }

  return families;
}

function addDriveFileId(target: Set<string>, value: unknown) {
  if (typeof value !== 'string') return;

  const trimmed = value.trim();
  if (isDriveFileId(trimmed)) {
    target.add(trimmed);
  }
}

function collectDriveFileIds(value: unknown, target = new Set<string>()) {
  if (typeof value === 'string') {
    addDriveFileId(target, value);
    return target;
  }

  if (Array.isArray(value)) {
    value.forEach(item => {
      collectDriveFileIds(item, target);
    });

    return target;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => {
      collectDriveFileIds(item, target);
    });
  }

  return target;
}

export function createGuestRenderHints(params: {
  bulkData: BulkJson;
  blocks: PersistedEditorBlock[];
  shareUrl: ShareUrlState;
  mainPoster: MainPosterData;
}): GuestRenderHints {
  // 저장 시점에 폰트 후보를 미리 계산해 게스트 첫 렌더의 전체 block 순회를 줄인다.
  const fonts = collectFontFamilies({
    blocks: params.blocks,
    titleData: params.bulkData.titleData,
    bodyData: params.bulkData.bodyData,
  });

  fonts.add(resolveFontFamily(params.bulkData.titleData.font));
  fonts.add(resolveFontFamily(params.bulkData.bodyData.font));

  const primaryImageFileIds = new Set<string>();
  addDriveFileId(primaryImageFileIds, params.mainPoster.thumbnailFileId);
  collectDriveFileIds(params.shareUrl.urlImage, primaryImageFileIds);
  collectDriveFileIds(params.shareUrl.images, primaryImageFileIds);

  // 첫 화면에 가까운 block 이미지만 우선 힌트에 넣어 과한 preload 후보를 피한다.
  params.blocks.slice(0, ABOVE_THE_FOLD_BLOCK_COUNT).forEach(block => {
    collectDriveFileIds(block.props, primaryImageFileIds);
  });

  return {
    schemaVersion: 1,
    fonts: Array.from(fonts),
    primaryImageFileIds: Array.from(primaryImageFileIds),
    aboveTheFoldBlockIds: params.blocks
      .slice(0, ABOVE_THE_FOLD_BLOCK_COUNT)
      .map(block => block.id),
  };
}
