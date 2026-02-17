import { useEffect, useRef, useState } from 'react';

import { useBgmStore } from '../store/useBgmStore';

export function useBgmPlayer(currentSrc: string | null) {
  const { isLoop, volume, selectedBgmId, setSelectedBgmId, setIsLoop } =
    useBgmStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio 이벤트와 동기화되는 재생 상태 (스토어 불필요 — 언마운트 시 어차피 멈춤)
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio 객체 초기화 및 이벤트 등록 (마운트 1회)
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
    // volume은 마운트 시 1회만 반영 (이후 변경은 별도 effect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // currentSrc가 실제로 바뀔 때만 src 교체
  useEffect(() => {
    if (!currentSrc) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = currentSrc;
    audio.load();
    setIsPlaying(false);
  }, [currentSrc]);

  // 스토어의 isLoop 변경 반영
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = isLoop;
  }, [isLoop]);

  // 스토어의 volume 변경 반영
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch((error: unknown) => {
        console.error('BGM play() failed', error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  };

  return {
    isLoop,
    isPlaying,
    selectedBgm: selectedBgmId,
    selectBgm: setSelectedBgmId,
    setIsLoop,
    togglePlay,
  };
}