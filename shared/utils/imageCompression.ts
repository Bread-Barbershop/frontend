// 압축 대상에서 제외하는 MIME 타입 (애니메이션 손실 우려, 벡터 포맷)
const EXCLUDED_MIME_TYPES = ['image/gif', 'image/svg+xml'];

interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 0.8,
  maxSizeBytes: 1.5 * 1024 * 1024,
};

function calculateTargetSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function drawToBlob(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  quality: number
): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.convertToBlob({ type: 'image/jpeg', quality });
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
}

/**
 * 큰 이미지 파일을 브라우저 네이티브 API(createImageBitmap + canvas)로 리사이즈/압축한다.
 * 원본이 임계값보다 작거나 압축 대상이 아닌 포맷(GIF, SVG)이면 원본을 그대로 반환하고,
 * 디코딩 실패 시에도 예외를 던지지 않고 원본 File로 폴백한다.
 */
export async function compressImage(
  file: File,
  options?: CompressImageOptions
): Promise<File> {
  const { maxWidth, maxHeight, quality, maxSizeBytes } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (EXCLUDED_MIME_TYPES.includes(file.type)) return file;
  if (file.size <= maxSizeBytes) return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const { width, height } = calculateTargetSize(
      bitmap.width,
      bitmap.height,
      maxWidth,
      maxHeight
    );

    const blob = await drawToBlob(bitmap, width, height, quality);
    if (!blob || blob.size >= file.size) return file;

    // 압축 결과는 항상 jpeg이므로 확장자도 실제 MIME 타입에 맞게 보정한다
    const compressedFileName = file.name.replace(/\.\w+$/, '.jpg');

    return new File([blob], compressedFileName, {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.warn(
      '[imageCompression] 이미지 압축 실패, 원본을 사용합니다:',
      error
    );
    return file;
  } finally {
    bitmap?.close();
  }
}

/** 여러 파일을 병렬로 compressImage 처리한다. */
export async function compressImages(
  files: File[],
  options?: CompressImageOptions
): Promise<File[]> {
  return Promise.all(files.map(file => compressImage(file, options)));
}
