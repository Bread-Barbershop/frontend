import { useEffect, useMemo, useRef, useState } from 'react';

import type { BgmItem } from './bgmList';

interface UseBgmPlayerOptions {
  volume?: number;
}

export function useBgmPlayer(
  bgmList: readonly BgmItem[],
  options?: UseBgmPlayerOptions
) {
  const volume = options?.volume ?? 0.2;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedBgm, setSelectedBgm] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  const bgmById = useMemo(
    () => new Map(bgmList.map(item => [item.id, item])),
    [bgmList]
  );

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = isLoop;
  }, [isLoop]);

  const selectBgm = (bgmId: string) => {
    setSelectedBgm(bgmId);
  };

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
