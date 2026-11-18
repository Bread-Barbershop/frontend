'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useEditorBgmPlayer } from '@/components/organisms/bgm/context/EditorBgmPlayerContext';
import InvitationPreviewModal from '@/features/invitation/preview/InvitationPreviewModal';
import {
  createPreviewSnapshot,
  type PreviewSnapshot,
} from '@/features/invitation/preview/previewSnapshot';
import {
  useFabricActionsContext,
  useFabricViewContext,
} from '@/widgets/mainPoster/context/FabricContext';

export default function InvitationPreviewButton() {
  const { canvas } = useFabricViewContext();
  const { exportCanvasPreview } = useFabricActionsContext();
  const bgmPlayer = useEditorBgmPlayer();
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null);
  const [error, setError] = useState(false);
  const resourceRef = useRef<ReturnType<typeof createPreviewSnapshot> | null>(
    null
  );
  const close = useCallback(() => {
    setSnapshot(null);
    resourceRef.current?.dispose();
    resourceRef.current = null;
  }, []);
  useEffect(() => () => resourceRef.current?.dispose(), []);

  const open = () => {
    if (resourceRef.current) return;
    setError(false);
    try {
      const poster = exportCanvasPreview();
      if (!poster) throw new Error('Poster is not ready');
      const resource = createPreviewSnapshot(poster.dataUrl);
      resourceRef.current = resource;
      if (bgmPlayer.isPlaying) bgmPlayer.togglePlay();
      setSnapshot(resource.snapshot);
    } catch {
      resourceRef.current?.dispose();
      resourceRef.current = null;
      setError(true);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={!canvas}
        aria-haspopup="dialog"
        onClick={open}
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center text-sm font-semibold transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        미리보기
      </button>
      {error && (
        <p
          role="alert"
          className="text-center text-xs leading-relaxed text-text-secondary"
        >
          미리보기를 준비하지 못했어요. 잠시 후 다시 눌러주세요.
        </p>
      )}
      {snapshot && (
        <InvitationPreviewModal
          snapshot={snapshot}
          source="draft"
          onClose={close}
        />
      )}
    </>
  );
}
