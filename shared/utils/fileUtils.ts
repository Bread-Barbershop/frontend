// 파일 hash 캐싱 (WeakMap으로 메모리 누수 방지)
const fileHashCache = new WeakMap<File, Promise<string>>();

/**
 * 파일의 실제 내용을 SHA-256으로 해시하여 고유한 식별 키를 생성합니다.
 * imageId를 포함하여 같은 파일을 여러 블록에서 사용할 수 있도록 합니다.
 *
 * @param file - 식별 키를 생성할 File 객체
 * @param imageId - 블록에서의 이미지 ID (같은 파일도 이미지별로 구분)
 * @returns imageId_파일해시 형태의 고유 문자열
 */
export async function getFileKey(file: File, imageId: string): Promise<string> {
  // 캐시 확인
  if (fileHashCache.has(file)) {
    const fileHash = await fileHashCache.get(file)!;
    return `${imageId}_${fileHash}`;
  }

  // 해시 계산
  const hashPromise = (async () => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      return hashHex;
    } catch (error) {
      // 폴백: 메타데이터 기반 키 (해시 계산 실패 시)
      console.warn('File hash calculation failed, using metadata fallback:', error);
      return `${file.name}_${file.size}_${file.lastModified}`;
    }
  })();

  // 캐시에 저장
  fileHashCache.set(file, hashPromise);
  const fileHash = await hashPromise;
  return `${imageId}_${fileHash}`;
}
