'use client';

import { useState } from 'react';

import { useEditorBgmPlayer } from '../context/EditorBgmPlayerContext';

import { BgmPlaybackHint } from './BgmPlaybackHint';
import BgmToggleButton from './BgmToggleButton';

export function EditorBgmOverlay() {
  const { hasSelectedBgm, isPlaying, sourceKey, togglePlay } =
    useEditorBgmPlayer();

  if (!hasSelectedBgm || !sourceKey) return null;

  return (
    <EditorBgmOverlayForSource
      key={sourceKey}
      isPlaying={isPlaying}
      onToggle={togglePlay}
    />
  );
}

function EditorBgmOverlayForSource({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean;
  onToggle: () => void;
}) {
  const [isHintDismissed, setIsHintDismissed] = useState(false);

  const handleToggle = () => {
    setIsHintDismissed(true);
    onToggle();
  };

  return (
    <>
      <BgmPlaybackHint isDismissed={isHintDismissed} />
      <BgmToggleButton isOn={isPlaying} onToggle={handleToggle} />
    </>
  );
}
