import { useEffect, useRef, useState } from 'react';

import { EditorBlock } from '@/shared/types/block';

import { SavedData } from '../types/savedata';
import { fetchAudioFiles, fetchImageFiles } from '../utils/fetchFile';

interface UseSavedDataReturn {
  savedData: SavedData | null;
  loading: boolean;
  error: string | null;
}

export const useSavedData = (folderId: string): UseSavedDataReturn => {
  const [savedData, setSavedData] = useState<SavedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이전 요청 취소용
  const abortRef = useRef<AbortController | null>(null);

  const setImageFile = async (
    blocks: EditorBlock[],
    imageFile: { id: string; name: string; mimeType: string }[] | null,
    signal: AbortSignal
  ) => {
    if (imageFile && imageFile.length > 0) {
      const imageFiles = await fetchImageFiles(imageFile, signal);

      if (imageFiles.length > 0) {
        const galleryBlock = blocks.map(block => {
          if ('images' in block.props) {
            return {
              ...block,
              props: {
                ...block.props,
                images: (block.props.images || [])
                  .map(image => {
                    return imageFiles.find(file => file.id === image)?.file;
                  })
                  .filter((file): file is File => file !== undefined),
              },
            };
          }
          return block;
        });
        return galleryBlock;
      } else {
        const emptyImageBlock = blocks.map(block => {
          if ('images' in block.props) {
            return {
              ...block,
              props: {
                ...block.props,
                images: [],
              },
            };
          }
          return block;
        });
        return emptyImageBlock;
      }
    } else {
      return blocks;
    }
  };

  const setAudioFile = async (
    audioFile: { id: string; name: string; mimeType: string }[],
    signal: AbortSignal
  ) => {
    if (audioFile && audioFile.length > 0) {
      const audioFiles = await fetchAudioFiles(audioFile, signal);
      return audioFiles[0].file;
    } else {
      return null;
    }
  };
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

        if (!data || !data.config) return;

        const updatedBlocks: EditorBlock[] = data.config.blocks;

        const updatedBlocksWithImages = await setImageFile(
          updatedBlocks,
          data.images.files,
          controller.signal
        );

        const audioFiles = await setAudioFile(
          data.audios.files,
          controller.signal
        );

        setSavedData({
          blocks: updatedBlocksWithImages,
          mainPoster: data.config.mainPoster,
          bgm: {
            bgmInfo: data.config.bgm,
            bgmFile: audioFiles,
          },
          imageFolderId: data.imageFolderId,
          audioFolderId: data.audioFolderId,
        });
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

  return {
    savedData,
    loading,
    error,
  };
};
