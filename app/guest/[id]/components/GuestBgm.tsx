// app/guest/[id]/components/GuestBgm.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { BGM_LIST } from '@/components/organisms/bgm/data/bgmList';

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

function GuestBgm({ bgm }: GuestBgmProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOn, setIsOn] = useState(false);

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

  return (
    <>
      <audio ref={audioRef} preload="none" />
      {src && (
        <button
          type="button"
          className="fixed right-4 top-4 z-50 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white"
          onClick={() => setIsOn(prev => !prev)}
        >
          {isOn ? 'ON' : 'OFF'}
        </button>
      )}
    </>
  );
}

export default GuestBgm;
