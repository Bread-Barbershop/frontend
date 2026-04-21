import { useEffect, useRef, useState } from 'react';

import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
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
    if (!imageFile || imageFile.length === 0) return blocks;

    const imageFiles = await fetchImageFiles(imageFile, signal);
    const idToFileMap = new Map<string, File>();
    imageFiles.forEach(item => idToFileMap.set(item.id, item.file));

    const mapIdsToFiles = (obj: unknown): unknown => {
      if (typeof obj === 'string') {
        return idToFileMap.get(obj) || obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(mapIdsToFiles);
      }
      if (obj !== null && typeof obj === 'object') {
        const newObj: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          newObj[key] = mapIdsToFiles(value);
        }
        return newObj;
      }
      return obj;
    };

    return blocks.map(block => ({
      ...block,
      props: mapIdsToFiles(block.props) as typeof block.props,
    }));
  };

  const setAudioFile = async (
    audioFile: { id: string; name: string; mimeType: string }[],
    signal: AbortSignal
  ) => {
    if (audioFile && audioFile.length > 0) {
      const audioFiles = await fetchAudioFiles(audioFile, signal);
      return audioFiles.length > 0 ? audioFiles[0].file : null;
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
        const res = await fetch(`/api/drive/updateInvitation?id=${folderId}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('저장된 데이터를 불러오지 못했습니다.');

        const data = await res.json();

        if (
          !data?.config ||
          !Array.isArray(data.config.blocks) ||
          !data.config.bgm
        ) {
          throw new Error('저장 데이터 형식이 올바르지 않습니다.');
        }

        const updatedBlocks: EditorBlock[] = data.config.blocks;
        const updatedBulkData = data.config.bulkData ?? {
          backgroundColor: '#FFFFFF',
          titleData: TITLE_BULK_DATA,
          bodyData: BODY_BULK_DATA,
        };
        const updatedBlocksWithImages = await setImageFile(
          updatedBlocks,
          data.images.files ?? null,
          controller.signal
        );

        const audioFiles = await setAudioFile(
          data.audios.files ?? null,
          controller.signal
        );

        setSavedData({
          bulkData: updatedBulkData,
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
        if (abortRef.current === controller) {
          setLoading(false);
        }
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
