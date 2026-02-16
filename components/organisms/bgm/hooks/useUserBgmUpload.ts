import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { formatDuration } from '../utils/formatDuration';
import { getAudioDurationFromUrl } from '../utils/getAudioDurationFromUrl';

import type { BgmItem } from '../data/bgmList';

export const USER_BGM_ID = 'user-bgm';

export function useUserBgmUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userBgm, setUserBgm] = useState<BgmItem | null>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const uploadUserBgm = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return false;

    // 파일 포맷 검증 (mp3만 허용)
    if (
      file.type !== 'audio/mpeg' &&
      !file.name.toLowerCase().endsWith('.mp3')
    ) {
      alert('MP3 파일만 업로드 가능합니다.');
      return false;
    }

    // 파일 용량 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return false;
    }

    const objectUrl = URL.createObjectURL(file);
    let duration = '00:00';

    try {
      const durationSeconds = await getAudioDurationFromUrl(objectUrl);
      duration = formatDuration(durationSeconds);
    } catch {
      duration = '00:00';
    }

    setUserBgm({
      id: USER_BGM_ID,
      title: file.name,
      duration,
      src: objectUrl,
    });

    return true;
  };

  useEffect(() => {
    return () => {
      if (userBgm?.src.startsWith('blob:')) {
        URL.revokeObjectURL(userBgm.src);
      }
    };
  }, [userBgm]);

  return {
    fileInputRef,
    openFilePicker,
    uploadUserBgm,
    userBgm,
  };
}
