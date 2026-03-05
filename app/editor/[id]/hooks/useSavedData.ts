import { useEffect, useRef, useState } from 'react';

import { BgmData } from '@/app/oauthTest/utils/saveInvitationFlow';
import { EditorBlock } from '@/shared/types/block';

import { fetchImageFiles } from '../utils/fetchFile';

interface UseSavedDataReturn {
  blocks: EditorBlock[]; // singular
  bgm: BgmData | null;
  loading: boolean;
  error: string | null;
}

export const useSavedData = (folderId: string): UseSavedDataReturn => {
  const [blocks, setBlocks] = useState<EditorBlock[]>([]); // internal state renamed to avoid confusion
  const [bgm, setBgm] = useState<BgmData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이전 요청 취소용
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!folderId) return;

    // 이전 요청 취소
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchSavedData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) 저장된 데이터 조회
        const res = await fetch(`/api/drive/updateInvitaion?id=${folderId}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('저장된 데이터를 불러오지 못했습니다.');

        const data = await res.json();
        console.log('data', data);
        if (!data || !data.config) return;

        const updatedBlocks: EditorBlock[] = data.config.blocks;
        setBgm(
          data.config.blocks.find(
            (block: EditorBlock) => block.component === 'bgm'
          )?.props as BgmData
        );

        if (data.images?.files && data.images.files.length > 0) {
          const imageFiles = await fetchImageFiles(
            data.images.files,
            controller.signal
          );

          if (imageFiles.length > 0) {
            const galleryBlock = updatedBlocks.map(block => {
              return {
                ...block,
                props: {
                  ...block.props,
                  ...('images' in block.props && {
                    images: block.props.images
                      .map(image => {
                        return imageFiles.find(file => file.id === image)?.file;
                      })
                      .filter((file): file is File => file !== undefined),
                  }),
                },
              };
            });
            setBlocks(galleryBlock);
          }
        } else {
          setBlocks(updatedBlocks);
        }

        // 3) 오디오 처리 (TODO)
        if (data.audios.length > 0) {
          console.log('audioList', data.audios);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : '알 수 없는 에러';
        setError(message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedData();

    return () => controller.abort();
  }, [folderId]);

  return { blocks, bgm, loading, error };
};
