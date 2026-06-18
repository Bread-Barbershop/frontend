'use client';

import { useEffect, useMemo, useState } from 'react';

import { useDriveImageResolveContext } from '@/shared/hooks/useDriveImageResolveMode';
import { resolveDriveImageSource } from '@/shared/utils/media/driveImageUtils';

export type ResolvableImageSource = File | string | null | undefined;

/**
 * 단일 이미지 소스를 렌더링 가능한 문자열 URL로 변환합니다.
 * - File: 객체 URL(object URL)을 생성하고 컴포넌트 언마운트(cleanup) 시 이를 해제(revoke)합니다.
 * - 문자열 URL: 그대로 유지합니다.
 * - Drive 파일 ID 문자열: Drive 썸네일 URL로 변환합니다.
 */
export function useResolvedImageSource(
  source: ResolvableImageSource,
  v?: string
) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const imageResolveContext = useDriveImageResolveContext();

  useEffect(() => {
    if (!(source instanceof File)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(source);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [source]);

  return useMemo(() => {
    if (!source) return null;
    if (source instanceof File) return objectUrl;
    return resolveDriveImageSource(source, {
      folderId: imageResolveContext.folderId,
      mode: imageResolveContext.mode,
      v,
    });
  }, [
    imageResolveContext.folderId,
    imageResolveContext.mode,
    objectUrl,
    source,
    v,
  ]);
}
