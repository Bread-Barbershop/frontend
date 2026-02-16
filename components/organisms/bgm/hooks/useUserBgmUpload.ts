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
