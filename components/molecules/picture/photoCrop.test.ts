import { convertToPixelCrop } from 'react-image-crop';

import { centeredPhotoCrop } from './photoCrop';

describe('사진 자르기 영역', () => {
  it.each([
    [1200, 800],
    [800, 1200],
    [300, 1200],
  ])('%i × %i 사진에서 선택한 비율이 원본 안에 들어간다', (width, height) => {
    const aspect = 3 / 4;
    const crop = centeredPhotoCrop(width, height, aspect);
    const pixels = convertToPixelCrop(crop, width, height);
    expect(pixels.width / pixels.height).toBeCloseTo(aspect);
    expect(2 * pixels.x + pixels.width).toBeCloseTo(width);
    expect(2 * pixels.y + pixels.height).toBeCloseTo(height);
    expect(pixels.x).toBeGreaterThanOrEqual(0);
    expect(pixels.y).toBeGreaterThanOrEqual(0);
  });

  it('일반 사진은 선택한 영역 전체를 사용한다', () => {
    const crop = centeredPhotoCrop(800, 1200);
    expect(convertToPixelCrop(crop, 800, 1200)).toEqual({
      unit: 'px',
      x: 0,
      y: 0,
      width: 800,
      height: 1200,
    });
  });
});
