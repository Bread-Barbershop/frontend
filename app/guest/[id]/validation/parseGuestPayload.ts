import type { BulkData } from '@/shared/types/block';
import type { GuestRenderHints } from '@/shared/types/renderHints';

import {
  normalizeGuestBlock,
  type GuestBlockWarning,
} from './normalizeGuestBlock';

import type {
  BulkJson,
  GuestBgm,
  GuestBlock,
  GuestMainPosterData,
  GuestPayload,
} from '../types/guestTypes';
import type {
  SerializedImageProps,
  SerializedObjectProps,
  SerializedTextboxProps,
} from 'fabric';

export type GuestPayloadFailureReason =
  | 'payload_not_object'
  | 'blocks_not_array'
  | 'invalid_main_poster'
  | 'invalid_bgm'
  | 'invalid_bulk_data';

export type GuestPayloadWarning = GuestBlockWarning;

export type NormalizedGuestPayload = GuestPayload;

type GuestShareLocationInfo = NonNullable<
  NonNullable<GuestPayload['shareUrl']>['locationInfo']
>;

export type GuestPayloadParseResult =
  | {
      ok: true;
      payload: NormalizedGuestPayload;
      warnings: GuestPayloadWarning[];
    }
  | {
      ok: false;
      reason: GuestPayloadFailureReason;
      details?: unknown;
    };

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function isNullableString(x: unknown): x is string | null {
  return x === null || typeof x === 'string';
}

function isBulkData(x: unknown): x is BulkData {
  if (!isRecord(x)) return false;

  return (
    typeof x.font === 'string' &&
    typeof x.fontSize === 'string' &&
    typeof x.fontWeight === 'string' &&
    typeof x.color === 'string' &&
    typeof x.isDefault === 'boolean'
  );
}

function normalizeBulkJson(x: unknown): BulkJson | null {
  if (!isRecord(x)) return null;
  if (typeof x.backgroundColor !== 'string') return null;
  if (!isBulkData(x.titleData)) return null;
  if (!isBulkData(x.bodyData)) return null;

  return {
    backgroundColor: x.backgroundColor,
    titleData: x.titleData,
    bodyData: x.bodyData,
    // 구형 data.json에는 isZoom이 없을 수 있으므로 안전한 기본값을 둔다.
    isZoom: typeof x.isZoom === 'boolean' ? x.isZoom : false,
  };
}

function normalizeGuestBgm(x: unknown): GuestBgm | null {
  if (!isRecord(x)) return null;

  if (
    !isNullableString(x.selectedBgmId) ||
    typeof x.isLoop !== 'boolean' ||
    typeof x.volume !== 'number' ||
    !isNullableString(x.userBgmTitle) ||
    !isNullableString(x.userBgmDuration) ||
    !isNullableString(x.userBgmFileId)
  ) {
    return null;
  }

  return {
    selectedBgmId: x.selectedBgmId,
    isLoop: x.isLoop,
    volume: x.volume,
    userBgmTitle: x.userBgmTitle,
    userBgmDuration: x.userBgmDuration,
    userBgmFileId: x.userBgmFileId,
  };
}

function normalizeGuestMainPosterData(x: unknown): GuestMainPosterData | null {
  if (!isRecord(x)) return null;

  if (
    typeof x.version !== 'string' ||
    !Array.isArray(x.objects) ||
    !x.objects.every(isRecord)
  ) {
    return null;
  }

  if (x.background !== undefined && typeof x.background !== 'string') {
    return null;
  }

  if (
    x.thumbnailFileId !== undefined &&
    typeof x.thumbnailFileId !== 'string'
  ) {
    return null;
  }

  return {
    version: x.version,
    objects: x.objects as unknown as (
      | SerializedTextboxProps
      | SerializedImageProps
      | SerializedObjectProps
    )[],
    background: x.background,
    thumbnailFileId: x.thumbnailFileId,
  };
}

function normalizeGuestBlocks(blocks: unknown[]) {
  const normalizedBlocks: GuestBlock[] = [];
  const warnings: GuestPayloadWarning[] = [];

  // block 단위 오류는 전체 초대장을 막지 않고 warning으로 남긴 뒤 제외한다.
  blocks.forEach((block, index) => {
    const result = normalizeGuestBlock(block, index);
    if (result.ok) {
      normalizedBlocks.push(result.block);
      return;
    }

    warnings.push(result.warning);
  });

  return { blocks: normalizedBlocks, warnings };
}

function normalizeShareLocationInfo(
  value: unknown
): GuestShareLocationInfo | null | undefined {
  if (value === undefined) return undefined;

  if (
    !isRecord(value) ||
    typeof value.lat !== 'number' ||
    typeof value.lng !== 'number' ||
    typeof value.placeName !== 'string'
  ) {
    return null;
  }

  return {
    lat: value.lat,
    lng: value.lng,
    placeName: value.placeName,
  };
}

function normalizeShareUrl(
  shareUrl: unknown
): GuestPayload['shareUrl'] | undefined {
  if (!isRecord(shareUrl)) return undefined;
  if (
    typeof shareUrl.title !== 'string' ||
    typeof shareUrl.description !== 'string' ||
    !Array.isArray(shareUrl.images) ||
    !shareUrl.images.every((v): v is string => typeof v === 'string') ||
    typeof shareUrl.urlTitle !== 'string' ||
    typeof shareUrl.urlDescription !== 'string' ||
    !Array.isArray(shareUrl.urlImage) ||
    !shareUrl.urlImage.every((v): v is string => typeof v === 'string') ||
    typeof shareUrl.showLocationButton !== 'boolean'
  ) {
    return undefined;
  }

  const locationInfo = normalizeShareLocationInfo(shareUrl.locationInfo);
  if (locationInfo === null) {
    return undefined;
  }

  return {
    title: shareUrl.title,
    description: shareUrl.description,
    images: shareUrl.images,
    urlTitle: shareUrl.urlTitle,
    urlDescription: shareUrl.urlDescription,
    urlImage: shareUrl.urlImage,
    showLocationButton: shareUrl.showLocationButton,
    ...(locationInfo ? { locationInfo } : {}),
  };
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value.filter(
        (item): item is string => typeof item === 'string' && item.length > 0
      )
    )
  );
}

function normalizeRenderHints(value: unknown): GuestRenderHints | undefined {
  if (!isRecord(value)) return undefined;

  // renderHints는 최적화용 선택 필드라서 값이 틀려도 렌더링 실패로 보지 않는다.
  return {
    schemaVersion: 1,
    fonts: normalizeStringArray(value.fonts),
    primaryImageFileIds: normalizeStringArray(value.primaryImageFileIds),
    aboveTheFoldBlockIds: normalizeStringArray(value.aboveTheFoldBlockIds),
  };
}

export function parseGuestPayload(input: unknown): GuestPayloadParseResult {
  if (!isRecord(input)) {
    return { ok: false, reason: 'payload_not_object' };
  }

  if (!Array.isArray(input.blocks)) {
    return { ok: false, reason: 'blocks_not_array' };
  }

  const mainPoster = normalizeGuestMainPosterData(input.mainPoster);
  if (!mainPoster) {
    return { ok: false, reason: 'invalid_main_poster' };
  }

  const bgm = normalizeGuestBgm(input.bgm);
  if (!bgm) {
    return { ok: false, reason: 'invalid_bgm' };
  }

  const bulkData = normalizeBulkJson(input.bulkData);
  if (!bulkData) {
    return { ok: false, reason: 'invalid_bulk_data' };
  }

  const { blocks, warnings } = normalizeGuestBlocks(input.blocks);
  const shareUrl = normalizeShareUrl(input.shareUrl);
  const renderHints = normalizeRenderHints(input.renderHints);

  // 최상위 필수 데이터는 엄격하게, block/renderHints는 호환성 있게 정규화한다.
  return {
    ok: true,
    payload: {
      bulkData,
      blocks,
      bgm,
      mainPoster,
      ...(shareUrl ? { shareUrl } : {}),
      ...(renderHints ? { renderHints } : {}),
    },
    warnings,
  };
}
