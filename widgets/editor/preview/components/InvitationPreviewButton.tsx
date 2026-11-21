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
  const [preview, setPreview] = useState<
    'closed' | 'preparing' | 'error' | PreviewSnapshot
  >('closed');
  const frameRef = useRef<number | null>(null);
  const resourceRef = useRef<ReturnType<typeof createPreviewSnapshot> | null>(
    null
  );
  const release = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    resourceRef.current?.dispose();
    resourceRef.current = null;
  }, []);
  useEffect(() => release, [release]);
  const close = useCallback(() => {
    release();
    setPreview('closed');
  }, [release]);

  const open = () => {
    if (frameRef.current !== null || resourceRef.current) return;
    setPreview('preparing');

    // 첫 프레임에 준비 화면을 그리고 다음 프레임에서 동기 이미지 변환을 시작한다.
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        try {
          const poster = exportCanvasPreview();
          if (!poster) throw new Error('Poster is not ready');
          const resource = createPreviewSnapshot(poster.dataUrl);
          resourceRef.current = resource;
          if (bgmPlayer.isPlaying) bgmPlayer.togglePlay();
          setPreview(resource.snapshot);
        } catch {
          release();
          setPreview('error');
        }
      });
    });
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
      {preview !== 'closed' && (
        <InvitationPreviewModal
          snapshot={typeof preview === 'object' ? preview : null}
          source="draft"
          loadError={
            preview === 'error'
              ? { message: '미리보기를 준비하지 못했어요.', onRetry: open }
              : undefined
          }
          onClose={close}
        />
      )}
    </>
  );
}
