/**
 * 갤러리 캐러셀의 연속적이고 끊김 없는 무한 롤링(loop)을 위해
 * 원본 사진 목록을 필요한 최소 슬라이드 개수 이상으로 안전하게 반복 구성한다.
 * Embla Carousel의 canLoop 조건(화면 너비 대비 충분한 버퍼 슬라이드 확보)을 항상 충족하여
 * 사진 개수가 적더라도 빈 공간 없이 무한히 롤링되도록 보장한다.
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
