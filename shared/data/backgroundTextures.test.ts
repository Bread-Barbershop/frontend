import {
  DEFAULT_BACKGROUND_TEXTURE,
  resolveBackgroundTexture,
} from './backgroundTextures';

describe('저장한 배경 질감 정규화', () => {
  it.each([undefined, null, { material: 'missing', strength: 100 }])(
    '구형 또는 지원하지 않는 질감은 기본값으로 복원한다',
    value => {
      expect(resolveBackgroundTexture(value)).toEqual(DEFAULT_BACKGROUND_TEXTURE);
    }
  );

  it.each([
    [0, 0],
    [-20, 0],
    [43.7, 44],
    [150, 100],
    [Infinity, 50],
    ['90', 50],
  ])('강도 %s을 안전한 숫자 %s으로 복원한다', (strength, expected) => {
    expect(resolveBackgroundTexture({ material: 'linen', strength })).toEqual({
      material: 'linen',
      strength: expected,
    });
  });
});
