const DRIVE_FILE_ID_REGEX = /^[A-Za-z0-9_-]{10,}$/;

export type DriveImageResolveMode = 'public' | 'dashboard-preview';

type ResolveDriveImageSourceOptions = {
  folderId?: string;
  mode?: DriveImageResolveMode;
  v?: string;
};

/**
 * Builds a Google Drive public file URL from a file id.
 */
export function publicDriveFileUrl(fileId: string, v?: string) {
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}${
    v ? `?v=${encodeURIComponent(v)}` : ''
  }`;
}

export function previewDriveFileUrl(
  fileId: string,
  options: { folderId?: string; v?: string } = {}
) {
  // 미리보기 프록시는 fileId와 함께 folderId를 받아 해당 초대장 하위 파일인지 서버에서 검증한다.
  const params = new URLSearchParams({
    kind: 'image',
    fileId,
  });

  if (options.folderId) {
    params.set('folderId', options.folderId);
  }

  if (options.v) {
    params.set('v', options.v);
  }

  return `/api/drive/previewAsset?${params.toString()}`;
}

/**
 * Checks whether a string is an absolute HTTP(S) URL.
 */
export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Heuristic check for Google Drive file id shape.
 */
export function isDriveFileId(value: string) {
  return DRIVE_FILE_ID_REGEX.test(value);
}

/**
 * Resolves a raw image source into a renderable URL.
 */
export function resolveDriveImageSource(
  source: string,
  optionsOrVersion?: ResolveDriveImageSourceOptions | string
) {
  if (!source) return source;
  if (isHttpUrl(source)) return source;

  const options =
    typeof optionsOrVersion === 'string'
      ? { v: optionsOrVersion }
      : (optionsOrVersion ?? {});

  if (isDriveFileId(source)) {
    // dashboard-preview 모드에서는 비공개 이미지도 보이도록 인증 프록시 URL로 바꾼다.
    return options.mode === 'dashboard-preview'
      ? previewDriveFileUrl(source, {
          folderId: options.folderId,
          v: options.v,
        })
      : publicDriveFileUrl(source, options.v);
  }

  return source;
}
