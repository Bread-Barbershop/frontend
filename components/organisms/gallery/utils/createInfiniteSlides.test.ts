import { createInfiniteSlides } from './createInfiniteSlides';

describe('createInfiniteSlides 유틸 함수', () => {
  it('isLoopActive가 false인 경우 원본 배열을 그대로 반환한다', () => {
    const preview = ['1.jpg', '2.jpg'];
    const result = createInfiniteSlides(preview, false);
    expect(result).toEqual(preview);
  });

  it('preview가 빈 배열인 경우 빈 배열을 반환한다', () => {
    const result = createInfiniteSlides([], true);
    expect(result).toEqual([]);
  });

  it('기본 minSlides(12)가 적용되어 필요한 만큼만 적절히 복제한다', () => {
    const preview = ['1.jpg', '2.jpg'];
    const result = createInfiniteSlides(preview, true);
    expect(result.length).toBe(12);
    expect(result).toEqual([
      ...preview,
      ...preview,
      ...preview,
      ...preview,
      ...preview,
      ...preview,
    ]);
  });

  it('원본 배열 길이가 minSlides보다 작으면 최소 개수 이상으로 반복 구성한다', () => {
    const preview = ['1.jpg', '2.jpg', '3.jpg'];
    const result = createInfiniteSlides(preview, true, 8);
    expect(result.length).toBe(9);
    expect(result.slice(0, 3)).toEqual(preview);
    expect(result.slice(3, 6)).toEqual(preview);
    expect(result.slice(6, 9)).toEqual(preview);
  });

  it('원본 배열 길이가 이미 minSlides 이상이면 원본을 그대로 반환한다', () => {
    const preview = Array.from({ length: 15 }, (_, i) => `${i}.jpg`);
    const result = createInfiniteSlides(preview, true, 12);
    expect(result).toEqual(preview);
  });
});
