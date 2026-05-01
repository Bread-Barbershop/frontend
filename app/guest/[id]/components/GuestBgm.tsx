// app/guest/[id]/components/GuestBgm.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { BGM_LIST } from '@/components/organisms/bgm/data/bgmList';

import BgmToggleButton from './BgmToggleButton';

import type { GuestBgm as GuestBgmData } from '../types/guestTypes';

interface GuestBgmProps {
  bgm: GuestBgmData;
}

const USER_BGM_ID = 'user-bgm';

function proxyAudioUrl(fileId: string) {
  return `/api/drive/guestBgm?fileId=${encodeURIComponent(fileId)}`;
}

function clampVolume(volume: number) {
  if (Number.isNaN(volume)) return 0.2;
  return Math.min(1, Math.max(0, volume));
}

function BgmPlaybackHint({ isDismissed }: { isDismissed: boolean }) {
  const [isMounted, setIsMounted] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setIsVisible(true), 50);
    const fadeTimer = window.setTimeout(() => setIsVisible(false), 4300);
    const unmountTimer = window.setTimeout(() => setIsMounted(false), 5000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`pointer-events-none absolute right-14 top-4 z-50 flex h-8 items-center rounded-full bg-black/55 px-3 text-xs font-medium text-white shadow-sm backdrop-blur-md transition-opacity duration-700 ${
        isVisible && !isDismissed ? 'opacity-100' : 'opacity-0'
      }`}
    >
      클릭하면 음악이 재생됩니다
    </div>
  );
}

function GuestBgm({ bgm }: GuestBgmProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [isHintDismissed, setIsHintDismissed] = useState(false);
  const [isPosterReady, setIsPosterReady] = useState(false);

  const src = useMemo(() => {
    if (!bgm.selectedBgmId) return null;

    if (bgm.selectedBgmId === USER_BGM_ID) {
      if (!bgm.userBgmFileId) return null;
      return proxyAudioUrl(bgm.userBgmFileId);
    }

    return BGM_LIST.find(item => item.id === bgm.selectedBgmId)?.src ?? null;
  }, [bgm.selectedBgmId, bgm.userBgmFileId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = bgm.isLoop;
    audio.volume = clampVolume(bgm.volume);
  }, [bgm.isLoop, bgm.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!src) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      return;
    }

    audio.pause();
    audio.src = src;
    audio.load();
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!src || !isOn) {
      audio.pause();
      return;
    }

    const tryPlay = () => {
      void audio.play().catch(() => setIsOn(false));
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      tryPlay();
      return;
    }

    audio.addEventListener('canplay', tryPlay, { once: true });
    return () => {
      audio.removeEventListener('canplay', tryPlay);
    };
  }, [isOn, src]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    const handlePosterReady = () => setIsPosterReady(true);

    window.addEventListener('guest-main-poster-ready', handlePosterReady, {
      once: true,
    });

    return () => {
      window.removeEventListener('guest-main-poster-ready', handlePosterReady);
    };
  }, []);

  const handleToggle = () => {
    setIsHintDismissed(true);
    setIsOn(prev => !prev);
  };

  return (
    <>
      <audio ref={audioRef} preload="none" />
      {src && (
        <>
          {isPosterReady && <BgmPlaybackHint isDismissed={isHintDismissed} />}
          <BgmToggleButton isOn={isOn} onToggle={handleToggle} />
        </>
      )}
    </>
  );
}

export default GuestBgm;
