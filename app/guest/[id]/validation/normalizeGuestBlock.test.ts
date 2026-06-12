/**
 * @jest-environment node
 */

import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';

describe('normalizeGuestBlock', () => {
  it('schema fields 기준으로 누락된 props에 default를 채운다', () => {
    const result = normalizeGuestBlock(
      {
        id: 'gallery-block-id',
        type: 'wedding',
        component: 'gallery',
        props: {
          images: ['drive-image-file-id'],
        },
      },
      0
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.block.props).toMatchObject({
      title: '갤러리',
      images: ['drive-image-file-id'],
      template: 'galleryType1',
      ratio: '1:1',
      isPopupViewer: false,
      isEnglishTitle: true,
    });
  });

  it('registry schema에 없는 component는 warning과 함께 제외한다', () => {
    const result = normalizeGuestBlock(
      {
        id: 'unknown-block-id',
        type: 'wedding',
        component: 'unknownComponent',
        props: {},
      },
      3
    );

    expect(result).toEqual({
      ok: false,
      warning: {
        code: 'unknown_component',
        index: 3,
        blockId: 'unknown-block-id',
        component: 'unknownComponent',
      },
    });
  });

  it('props가 객체가 아니면 warning과 함께 제외한다', () => {
    const result = normalizeGuestBlock(
      {
        id: 'invalid-props-block-id',
        type: 'wedding',
        component: 'gallery',
        props: null,
      },
      1
    );

    expect(result).toEqual({
      ok: false,
      warning: {
        code: 'invalid_block_props',
        index: 1,
        blockId: 'invalid-props-block-id',
        component: 'gallery',
      },
    });
  });
});
