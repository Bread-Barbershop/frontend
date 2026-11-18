import {
  parseGuestPayload,
  type NormalizedGuestPayload,
} from '@/app/guest/[id]/validation/parseGuestPayload';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

export const INVITATION_PREVIEW_PATH = '/preview/invitation';
export const PREVIEW_MESSAGE = {
  ready: 'invia:draft-preview-ready',
  snapshot: 'invia:draft-preview-snapshot',
  rendered: 'invia:draft-preview-rendered',
  close: 'invia:draft-preview-close',
} as const;

export type PreviewSnapshot = {
  payload: NormalizedGuestPayload;
  previewFolderId: string;
  localAudioSrc: string | null;
};

export function parsePreviewSnapshot(input: unknown): PreviewSnapshot | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  const parsed = parseGuestPayload(value.payload);
  if (!parsed.ok || typeof value.previewFolderId !== 'string') return null;
  const audio =
    typeof value.localAudioSrc === 'string' &&
    value.localAudioSrc.startsWith('blob:')
      ? value.localAudioSrc
      : null;
  return {
    payload: parsed.payload,
    previewFolderId: value.previewFolderId,
    localAudioSrc: audio,
  };
}

/** A disposable browser-only snapshot. Never saves, publishes, or changes editor data. */
export function createPreviewSnapshot(posterDataUrl: string) {
  const editor = useEditorStore.getState();
  const bgm = useBgmStore.getState();
  const objectUrls = new Map<Blob, string>();
  const dispose = () => {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls.clear();
  };
  const resolveFiles = (value: unknown): unknown => {
    if (value instanceof Blob) {
      if (!objectUrls.has(value))
        objectUrls.set(value, URL.createObjectURL(value));
      return objectUrls.get(value);
    }
    if (Array.isArray(value)) return value.map(resolveFiles);
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, resolveFiles(child)])
      );
    return value;
  };

  try {
    const parsed = parseGuestPayload({
      blocks: resolveFiles(editor.block),
      bulkData: {
        backgroundColor: editor.backgroundColor,
        sectionStyle: editor.sectionStyle,
        titleData: { ...editor.titleData },
        bodyData: { ...editor.bodyData },
        isZoom: editor.isZoom,
        invitationPrivacy: editor.invitationPrivacy,
        scrollAnimation: editor.scrollAnimation,
      },
      mainPoster: { version: '1', objects: [], thumbnailFileId: posterDataUrl },
      bgm: {
        selectedBgmId: bgm.selectedBgmId,
        isLoop: bgm.isLoop,
        volume: bgm.volume,
        userBgmTitle: bgm.userFileName,
        userBgmDuration: bgm.userDuration,
        userBgmFileId: bgm.audioFileId,
      },
    });
    if (!parsed.ok) throw new Error('Could not prepare invitation preview');
    const snapshot: PreviewSnapshot = {
      payload: parsed.payload,
      previewFolderId: editor.invitationFolderId,
      localAudioSrc: bgm.userFileSrc,
    };
    return { snapshot, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
