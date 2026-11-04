/**
 * 갤러리 캐러셀의 연속적이고 끊김 없는 무한 롤링(loop)을 위해
 * 원본 사진 목록을 필요한 최소 슬라이드 개수 이상으로 안전하게 반복 구성한다.
 * minSlides는 최소 반복 개수이며, 실제 Embla canLoop 가능 여부는
 * 뷰포트 및 각 슬라이드의 렌더링 너비에도 영향을 받는다.
 */
export function createInfiniteSlides(
  preview: string[],
  isLoopActive: boolean,
  minSlides = 12
): string[] {
  if (!isLoopActive || preview.length === 0) return preview;
  if (preview.length >= minSlides) return preview;
  const repeatCount = Math.ceil(minSlides / preview.length);
  const result: string[] = [];
  for (let i = 0; i < repeatCount; i++) {
    result.push(...preview);
  }
  return result;
}
