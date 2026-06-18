'use client';

import { useEffect, useState } from 'react';

import { useDriveImageResolveContext } from '@/shared/hooks/useDriveImageResolveMode';
import { resolveDriveImageSource } from '@/shared/utils/media/driveImageUtils';

import type { ResolvableImageSource } from './useResolvedImageSource';

/**
 * 여러 이미지 소스를 렌더링 가능한 문자열 URL로 변환합니다.
 * - File: 각 항목마다 객체 URL(object URL)을 생성하고 컴포넌트 언마운트(cleanup) 시 이를 해제(revoke)합니다.
 * - 문자열 URL: 그대로 유지합니다.
 * - Drive 파일 ID 문자열: Drive 썸네일 URL로 변환합니다.
 */
export function useResolvedImageSources(
  sources: ResolvableImageSource[] | null | undefined,
  v?: string
) {
  const [resolvedSources, setResolvedSources] = useState<string[]>([]);
  const imageResolveContext = useDriveImageResolveContext();

  useEffect(() => {
    const items = sources ?? [];
    const objectUrls: string[] = [];
    const nextSources: string[] = [];

    items.forEach(source => {
      if (!source) return;

      if (source instanceof File) {
        const objectUrl = URL.createObjectURL(source);
        objectUrls.push(objectUrl);
        nextSources.push(objectUrl);
        return;
      }

      const resolved = resolveDriveImageSource(source, {
        folderId: imageResolveContext.folderId,
        mode: imageResolveContext.mode,
        v,
      });
      if (resolved) nextSources.push(resolved);
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedSources(nextSources);

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageResolveContext.folderId, imageResolveContext.mode, sources, v]);

  return resolvedSources;
}
