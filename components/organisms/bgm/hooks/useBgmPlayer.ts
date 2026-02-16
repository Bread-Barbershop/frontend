import { useEffect, useMemo, useRef, useState } from 'react';

import type { BgmItem } from '../data/bgmList';

interface UseBgmPlayerOptions {
  volume?: number;
}

export function useBgmPlayer(
  bgmList: readonly BgmItem[],
  options?: UseBgmPlayerOptions
) {
  const volume = options?.volume ?? 0.2;

  // 오디오 객체를 저장할 ref (렌더링과 무관)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 현재 선택된 BGM id
  const [selectedBgm, setSelectedBgm] = useState<string | null>(null);

  // UI 동기화용 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);

  // 반복 재생 여부 상태
  const [isLoop, setIsLoop] = useState(false);

  const bgmById = useMemo(
    () => new Map(bgmList.map(item => [item.id, item])),
    [bgmList]
  );

  // 오디오 초기화 및 이벤트 등록 (1회)
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [volume]);

  // 음악 선택 시 실행
  useEffect(() => {
    if (!selectedBgm) return;

    const bgm = bgmById.get(selectedBgm);
    if (!bgm) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = bgm.src;
    audio.load();
    void audio.play().catch(() => setIsPlaying(false));
  }, [bgmById, selectedBgm]);

  // 반복 재생 토글 시 현재 오디오에만 반영
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = isLoop;
  }, [isLoop]);

  const selectBgm = (bgmId: string) => {
    setSelectedBgm(bgmId);
  };

  // 재생 / 일시정지 토글
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  return {
    isLoop,
    isPlaying,
    selectedBgm,
    selectBgm,
    setIsLoop,
    togglePlay,
  };
}
