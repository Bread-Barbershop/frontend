// app/guest/[id]/components/GuestBgm.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { BgmPlaybackHint } from '@/components/organisms/bgm/components/BgmPlaybackHint';
import BgmToggleButton from '@/components/organisms/bgm/components/BgmToggleButton';
import { BGM_LIST } from '@/components/organisms/bgm/data/bgmList';

import type { GuestBgm as GuestBgmData } from '../types/guestTypes';

interface GuestBgmProps {
  bgm: GuestBgmData;
}

const USER_BGM_ID = 'user-bgm';

function driveAudioUrl(fileId: string) {
  return `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download`;
}

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
  const [isHintDismissed, setIsHintDismissed] = useState(false);
  const [isPosterReady, setIsPosterReady] = useState(false);
  const [directFailedUserBgmFileId, setDirectFailedUserBgmFileId] = useState<
    string | null
  >(null);
  const [requestedAudioKey, setRequestedAudioKey] = useState<string | null>(
    null
  );

  const isUserBgm = bgm.selectedBgmId === USER_BGM_ID;
  const shouldUseProxyForUserBgm =
    isUserBgm &&
    bgm.userBgmFileId !== null &&
    directFailedUserBgmFileId === bgm.userBgmFileId;

  const selectedAudioKey = useMemo(() => {
    if (!bgm.selectedBgmId) return null;

    if (isUserBgm) {
      if (!bgm.userBgmFileId) return null;
      return `${USER_BGM_ID}:${bgm.userBgmFileId}`;
    }

    return bgm.selectedBgmId;
  }, [bgm.selectedBgmId, bgm.userBgmFileId, isUserBgm]);

  const selectedAudioSrc = useMemo(() => {
    if (!bgm.selectedBgmId) return null;

    if (isUserBgm) {
      if (!bgm.userBgmFileId) return null;
      return shouldUseProxyForUserBgm
        ? proxyAudioUrl(bgm.userBgmFileId)
        : driveAudioUrl(bgm.userBgmFileId);
    }

    return BGM_LIST.find(item => item.id === bgm.selectedBgmId)?.src ?? null;
  }, [
    bgm.selectedBgmId,
    bgm.userBgmFileId,
    isUserBgm,
    shouldUseProxyForUserBgm,
  ]);

  const src =
    selectedAudioKey !== null && requestedAudioKey === selectedAudioKey
      ? selectedAudioSrc
      : null;

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
      if (audio.hasAttribute('src')) {
        audio.removeAttribute('src');
        audio.load();
      }
      return;
    }

    audio.pause();
    audio.src = src;
    audio.load();
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = () => {
      if (isUserBgm && bgm.userBgmFileId && !shouldUseProxyForUserBgm) {
        setDirectFailedUserBgmFileId(bgm.userBgmFileId);
        return;
      }

      setIsOn(false);
    };

    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('error', handleError);
    };
  }, [bgm.userBgmFileId, isUserBgm, shouldUseProxyForUserBgm]);

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
    if (!selectedAudioKey) return;

    setIsHintDismissed(true);
    setRequestedAudioKey(selectedAudioKey);
    setIsOn(prev => !prev);
  };

  return (
    <>
      <audio ref={audioRef} preload="none" />
      {selectedAudioSrc && (
        <>
          {isPosterReady && <BgmPlaybackHint isDismissed={isHintDismissed} />}
          <BgmToggleButton isOn={isOn} onToggle={handleToggle} />
        </>
      )}
    </>
  );
}

export default GuestBgm;
