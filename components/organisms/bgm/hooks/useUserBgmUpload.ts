import { useMemo, useRef, type ChangeEvent } from 'react';

import { useBgmStore } from '../store/useBgmStore';
import { formatDuration } from '../utils/formatDuration';
import { getAudioDurationFromUrl } from '../utils/getAudioDurationFromUrl';

import type { BgmItem } from '../data/bgmList';

export const USER_BGM_ID = 'user-bgm';

export function useUserBgmUpload() {
  const { userFile, userFileSrc, userFileName, userDuration, setUserFile } =
    useBgmStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userBgm: BgmItem | null = useMemo(() => {
    if (!userFile || !userFileSrc || !userFileName || !userDuration) {
      return null;
    }

    return {
      id: USER_BGM_ID,
      title: userFileName,
      duration: userDuration,
      src: userFileSrc,
    };
  }, [userDuration, userFile, userFileName, userFileSrc]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const uploadUserBgm = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return false;

    if (
      file.type !== 'audio/mpeg' &&
      !file.name.toLowerCase().endsWith('.mp3')
    ) {
      alert('MP3 파일만 업로드 가능합니다.');
      return false;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return false;
    }

    const tempUrl = URL.createObjectURL(file);
    let duration = '00:00';

    try {
      const durationSeconds = await getAudioDurationFromUrl(tempUrl);
      duration = formatDuration(durationSeconds);
    } catch {
      duration = '00:00';
    } finally {
      URL.revokeObjectURL(tempUrl);
    }

    setUserFile(file, file.name, duration);

    return true;
  };

  return {
    fileInputRef,
    openFilePicker,
    uploadUserBgm,
    userBgm,
  };
}
