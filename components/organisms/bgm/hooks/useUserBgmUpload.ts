import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

import { useBgmStore } from '../store/useBgmStore';
import { formatDuration } from '../utils/formatDuration';
import { getAudioDurationFromUrl } from '../utils/getAudioDurationFromUrl';

import type { BgmItem } from '../data/bgmList';

export const USER_BGM_ID = 'user-bgm';

export function useUserBgmUpload() {
  const { userFile, userFileName, userDuration, setUserFile } = useBgmStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Object URL은 File에서 파생되는 로컬 상태 (스토어에 넣지 않음)
  // 마운트 시 스토어에 File이 있으면 URL 재생성, 언마운트 시 revoke
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // 스토어의 userFile이 바뀔 때마다 Object URL 재생성
  useEffect(() => {
    if (!userFile) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(userFile);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [userFile]);

  // 스토어에 File이 있으면 BgmItem 형태로 조립 (컴포넌트가 사용하기 좋은 형태)
  const userBgm: BgmItem | null = useMemo(() => {
    if (!userFile || !objectUrl || !userFileName || !userDuration) {
      return null;
    }

    return {
      id: USER_BGM_ID,
      title: userFileName,
      duration: userDuration,
      src: objectUrl,
    };
  }, [objectUrl, userDuration, userFile, userFileName]);

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

    // duration 계산을 위해 임시 URL 사용 (setUserFile 전에 생성)
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

    // File과 메타데이터를 스토어에 저장
    // → useEffect가 File 변경을 감지해 재생용 Object URL을 새로 생성
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
