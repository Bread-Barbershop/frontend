/**
 * @jest-environment node
 */

import { resolveGuestFontFamiliesToPreload } from './guestFontPreload';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

const bulkData: NormalizedGuestPayload['bulkData'] = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    isDefault: false,
  },
  bodyData: {
    font: 'font-pretendard',
    fontSize: '16px',
    fontWeight: '400',
    color: '#222222',
    isDefault: false,
  },
  isZoom: false,
};

describe('resolveGuestFontFamiliesToPreload', () => {
  it('renderHints.fonts가 있으면 hints를 우선 사용한다', () => {
    const fonts = resolveGuestFontFamiliesToPreload({
      blocks: [
        {
          id: 'block-1',
          type: 'wedding',
          component: 'greeting',
          props: {
            messageHtml:
              '<p style="font-family: Hahmlet">fallback scan target</p>',
          },
        },
      ],
      bulkData,
      renderHints: {
        schemaVersion: 1,
        fonts: ['Pretendard'],
        primaryImageFileIds: [],
        aboveTheFoldBlockIds: [],
      },
    });

    expect(fonts).toEqual(expect.arrayContaining(['Pretendard', 'LINESeedKR']));
    expect(fonts).not.toContain('Hahmlet');
  });

  it('renderHints.fonts가 없으면 blocks를 훑어서 폰트를 찾는다', () => {
    const fonts = resolveGuestFontFamiliesToPreload({
      blocks: [
        {
          id: 'block-1',
          type: 'wedding',
          component: 'greeting',
          props: {
            messageHtml:
              '<p style="font-family: Hahmlet">fallback scan target</p>',
          },
        },
      ],
      bulkData,
    });

    expect(fonts).toEqual(
      expect.arrayContaining(['Hahmlet', 'LINESeedKR', 'Pretendard'])
    );
  });
});
