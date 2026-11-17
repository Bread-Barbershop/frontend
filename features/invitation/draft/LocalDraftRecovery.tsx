'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorState } from '@/shared/types/block';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import { isCanvasInitialized } from '@/widgets/mainPoster/utils/canvasReadiness';

import { registerDraftFlusher } from './draftLifecycle';
import { packDraft, unpackDraft } from './draftSerialization';
import {
  deleteLocalDraft,
  readLocalDraft,
  writeLocalDraft,
  type LocalDraft,
} from './localDraftStore';

const EDITOR_KEYS = [
  'block',
  'images',
  'backgroundColor',
  'titleData',
  'bodyData',
  'isZoom',
  'shareUrl',
  'invitationUuid',
  'invitationFolderId',
  'imageFolderId',
  'audioFolderId',
  'hashFiles',
  'cleanUpFiles',
  'isDirty',
] as const;
type EditorSnapshot = Pick<EditorState, (typeof EDITOR_KEYS)[number]>;
type BgmSnapshot = Pick<
  ReturnType<typeof useBgmStore.getState>,
  | 'selectedBgmId'
  | 'isLoop'
  | 'volume'
  | 'userFile'
  | 'userFileName'
  | 'userDuration'
  | 'audioFileId'
>;
type Snapshot = { editor: EditorSnapshot; bgm: BgmSnapshot; poster: object };

export default function LocalDraftRecovery({
  ready = true,
}: {
  ready?: boolean;
}) {
  const path = usePathname();
  const { canvas, initialData, runHistoryTransaction } = useFabricContext();
  const [pending, setPending] = useState<LocalDraft | null>(null);
  const [notice, setNotice] = useState('');
  const [blocked, setBlocked] = useState(false);
  const recovery = useRef<((restore: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (!canvas || !ready) return;
    let disposed = false;
    let enabled = false;
    let revoked = false;
    const revokedOwners = new Set<string>();
    let owner = '';
    let epoch = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let latest: Snapshot | null = null;
    let modifiedAt = 0;
    let queue = Promise.resolve();
    const objectUrls: string[] = [];
    const unsubscribe: (() => void)[] = [];
    const suspend = () => {
      revoked = true;
      enabled = false;
      setPending(null);
      setBlocked(true);
      setNotice('계정 연결이 바뀌었습니다. 이 탭을 새로고침해 주세요.');
    };
    const capture = (): Snapshot => {
      const state = useEditorStore.getState();
      const bgm = useBgmStore.getState();
      return {
        editor: Object.fromEntries(
          EDITOR_KEYS.map(key => [key, state[key]])
        ) as EditorSnapshot,
        bgm: {
          selectedBgmId: bgm.selectedBgmId,
          isLoop: bgm.isLoop,
          volume: bgm.volume,
          userFile: bgm.userFile,
          userFileName: bgm.userFileName,
          userDuration: bgm.userDuration,
          audioFileId: bgm.audioFileId,
        },
        poster: canvas.toObject([
          'id',
          'name',
          'isLocked',
          'lockMovementX',
          'lockMovementY',
          'lockScalingX',
          'lockScalingY',
          'lockRotation',
          'hasControls',
          'editable',
          'selectable',
          'evented',
          'slot',
          'imageBaseScale',
          'imageSliderX',
          'imageSliderY',
          'imageSliderScale',
          'slotBaseCropWidth',
          'slotBaseCropHeight',
          'slotZoomScale',
          'slotFrameWidth',
          'slotFrameHeight',
          'slotFrameLeft',
          'slotFrameTop',
          'slotFrameAngle',
          'slotImageBaseScale',
          'slotImageOffsetX',
          'slotImageOffsetY',
        ]),
      };
    };
    const flush = async () => {
      if (!enabled || !owner || !latest) return;
      clearTimeout(timer);
      const snapshot = latest;
      const timestamp = modifiedAt;
      const write = async () => {
        if (!enabled) return;
        const payload = await packDraft(snapshot);
        if (!enabled) return;
        const written = await writeLocalDraft(
          {
            id: `${owner}:${path}`,
            owner,
            path,
            modifiedAt: timestamp,
            payload,
          },
          epoch
        );
        if (!written && !disposed) suspend();
      };
      queue = queue.catch(() => undefined).then(write);
      await queue;
    };
    const failed = () => {
      if (!disposed)
        setNotice(
          '이 기기에 초안을 저장하지 못했습니다. 브라우저 저장 공간을 확인하고 Drive에 저장해 주세요.'
        );
    };
    const changed = () => {
      if (!enabled || disposed) return;
      // Ignore editor teardown; the previous snapshot must survive navigation.
      if (!useEditorStore.getState().invitationUuid) return;
      latest = capture();
      modifiedAt = Date.now();
      clearTimeout(timer);
      timer = setTimeout(() => {
        void flush().catch(failed);
      }, 750);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') void flush().catch(failed);
    };
    const checkAccount = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
        });
        if (!response.ok) return;
        const session = await response.json();
        if (owner && session.userId !== owner) suspend();
      } catch {
        /* A network interruption does not delete local drafts. */
      }
    };
    const revokeOwner = (value: string) => {
      revokedOwners.add(value);
      if (value === owner) suspend();
    };
    const onLogout = (event: Event) => revokeOwner((event as CustomEvent<string>).detail);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'invia-draft-logout' || !event.newValue) return;
      try { revokeOwner(JSON.parse(event.newValue).owner); } catch { /* Ignore unrelated storage data. */ }
    };
    window.addEventListener('invia-draft-logout', onLogout);
    window.addEventListener('storage', onStorage);
    const channel =
      typeof BroadcastChannel === 'undefined'
        ? null
        : new BroadcastChannel('invia-drafts');
    if (channel)
      channel.onmessage = event => {
        if (event.data?.type === 'logout') revokeOwner(event.data.owner);
      };

    const begin = async () => {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      if (!response.ok) throw new Error('session_unavailable');
      const session = await response.json();
      if (disposed || !session.isLoggedIn || !session.userId) return;
      owner = session.userId;
      if (revokedOwners.has(owner)) { suspend(); return; }
      const result = await readLocalDraft(owner, path);
      if (disposed || revoked) return;
      epoch = result.epoch;
      const start = () => {
        if (revoked || disposed) return;
        if (!useEditorStore.getState().invitationUuid)
          useEditorStore.getState().setInvitationUuid(crypto.randomUUID());
        enabled = true;
        unsubscribe.push(
          useEditorStore.subscribe((state, previous) => {
            if (EDITOR_KEYS.some(key => state[key] !== previous[key]))
              changed();
          }),
          useBgmStore.subscribe(changed),
          registerDraftFlusher(async () => {
            changed();
            await flush();
          })
        );
        for (const event of [
          'object:added',
          'object:removed',
          'object:modified',
          'text:changed',
          'path:created',
        ] as const)
          canvas.on(event, changed);
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('focus', checkAccount);
      };
      if (result.draft) {
        setPending(result.draft);
        recovery.current = async restore => {
          try {
            if (restore) {
              const snapshot = unpackDraft<Snapshot>(
                result.draft!.payload,
                objectUrls
              );
              await runHistoryTransaction(
                async () => {
                  await canvas.loadFromJSON(snapshot.poster);
                },
                { save: true }
              );
              if (revoked || disposed) return;
              useEditorStore.setState(snapshot.editor);
              const { userFile, ...bgm } = snapshot.bgm;
              useBgmStore.getState().reset();
              if (userFile)
                useBgmStore
                  .getState()
                  .setUserFile(
                    userFile,
                    bgm.userFileName ?? '',
                    bgm.userDuration ?? ''
                  );
              useBgmStore.setState(bgm);
              canvas.requestRenderAll();
            } else await deleteLocalDraft(owner, path);
            setPending(null);
            start();
          } catch {
            failed();
          }
        };
      } else start();
    };
    const onReady = (event: Event) => {
      if ((event as CustomEvent<object>).detail === canvas) {
        window.removeEventListener('invia-canvas-ready', onReady);
        void begin().catch(failed);
      }
    };
    if (!initialData || isCanvasInitialized(canvas)) void begin().catch(failed);
    else window.addEventListener('invia-canvas-ready', onReady);
    return () => {
      disposed = true;
      clearTimeout(timer);
      void flush()
        .catch(() => undefined)
        .finally(() => {
          for (const url of objectUrls) URL.revokeObjectURL(url);
        });
      for (const remove of unsubscribe) remove();
      for (const event of [
        'object:added',
        'object:removed',
        'object:modified',
        'text:changed',
        'path:created',
      ] as const)
        canvas.off(event, changed);
      window.removeEventListener('invia-canvas-ready', onReady);
      window.removeEventListener('invia-draft-logout', onLogout);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', checkAccount);
      document.removeEventListener('visibilitychange', onVisibility);
      channel?.close();
    };
  }, [canvas, initialData, path, ready, runHistoryTransaction]);

  return (
    <>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-[110] max-w-lg -translate-x-1/2 rounded-xl bg-white p-4 text-sm shadow-lg"
        >
          {notice}
        </div>
      )}
      {(pending || blocked) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="저장된 초안 복구"
            className="max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">
              {blocked
                ? '계정 연결이 변경됐어요'
                : '이 기기에 작성하던 초안이 있어요'}
            </h2>
            <p className="my-4 text-sm">
              {blocked
                ? '새로고침한 뒤 현재 계정으로 계속해 주세요.'
                : '사진과 음악을 포함해 이어서 작성할 수 있어요. 마지막 수정 후 7일 동안 보관돼요.'}
            </p>
            {blocked ? (
              <button type="button" onClick={() => window.location.reload()}>
                새로고침
              </button>
            ) : (
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => void recovery.current?.(false)}
                >
                  새로 시작하기
                </button>
                <button
                  type="button"
                  onClick={() => void recovery.current?.(true)}
                >
                  이어서 작성하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
