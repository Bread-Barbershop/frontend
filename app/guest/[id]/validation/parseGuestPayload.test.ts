/**
 * @jest-environment node
 */

import { parseGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

const bulkData = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#FA7564',
    bold: false,
    underline: false,
    italic: false,
    align: 'center',
    isDefault: false,
  },
  bodyData: {
    font: 'font-lineseed',
    fontSize: '16px',
    fontWeight: '500',
    color: '#000000',
    bold: false,
    underline: false,
    italic: false,
    align: 'center',
    isDefault: false,
  },
};

const basePayload = {
  mainPoster: {
    version: '1.0.0',
    objects: [],
    background: '#ffffff',
    thumbnailFileId: 'thumbnail-file-id',
  },
  blocks: [],
  bgm: {
    selectedBgmId: null,
    isLoop: false,
    volume: 0.2,
    userBgmTitle: null,
    userBgmDuration: null,
    userBgmFileId: null,
  },
  bulkData,
};

describe('parseGuestPayload', () => {
  it('유효한 payload를 정규화된 payload로 반환한다', () => {
    const result = parseGuestPayload({
      ...basePayload,
      blocks: [
        {
          id: 'greeting-block-id',
          type: 'wedding',
          component: 'greeting',
          props: {
            title: '초대합니다',
          },
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.warnings).toEqual([]);
    expect(result.payload.bulkData.isZoom).toBe(false);
    expect(result.payload.blocks).toHaveLength(1);
    expect(result.payload.blocks[0].props).toMatchObject({
      title: '초대합니다',
      englishTitle: 'INVITATION',
    });
  });

  it('renderHints가 있으면 optional 힌트로 정규화한다', () => {
    const result = parseGuestPayload({
      ...basePayload,
      renderHints: {
        schemaVersion: 999,
        fonts: ['Pretendard', 'Pretendard', '', 123],
        primaryImageFileIds: ['drive-image-file-id-123', null],
        aboveTheFoldBlockIds: ['block-1', 'block-1', 'block-2'],
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.payload.renderHints).toEqual({
      schemaVersion: 1,
      fonts: ['Pretendard'],
      primaryImageFileIds: ['drive-image-file-id-123'],
      aboveTheFoldBlockIds: ['block-1', 'block-2'],
    });
  });

  it('일부 block이 유효하지 않아도 전체 payload는 통과시키고 해당 block만 제외한다', () => {
    const result = parseGuestPayload({
      ...basePayload,
      blocks: [
        {
          id: 'valid-gallery-id',
          type: 'wedding',
          component: 'gallery',
          props: {},
        },
        {
          id: 'unknown-id',
          type: 'wedding',
          component: 'unknownComponent',
          props: {},
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.payload.blocks).toHaveLength(1);
    expect(result.payload.blocks[0].id).toBe('valid-gallery-id');
    expect(result.warnings).toEqual([
      {
        code: 'unknown_component',
        index: 1,
        blockId: 'unknown-id',
        component: 'unknownComponent',
      },
    ]);
  });

  it('최상위 blocks가 배열이 아니면 실패한다', () => {
    expect(
      parseGuestPayload({
        ...basePayload,
        blocks: 'not-array',
      })
    ).toEqual({
      ok: false,
      reason: 'blocks_not_array',
    });
  });

  it('최상위 bgm 구조가 잘못되면 실패한다', () => {
    expect(
      parseGuestPayload({
        ...basePayload,
        bgm: {
          selectedBgmId: null,
        },
      })
    ).toEqual({
      ok: false,
      reason: 'invalid_bgm',
    });
  });
});
