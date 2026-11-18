import 'server-only';

import { createHash } from 'node:crypto';

import type { InviteListItem } from '@/app/dashboard/types';
import { parseGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import {
  previewDriveFileUrl,
  publicDriveFileUrl,
} from '@/shared/utils/media/driveImageUtils';

import { captureDriveError } from './captureDriveError';
import {
  assertWorkspacePrivate,
  commitCloneFile,
  copyCloneAsset,
  createCloneFile,
  deleteCloneFile,
  DRIVE_FOLDER_MIME,
  DRIVE_JSON_MIME,
  getCloneFile,
  inCloneBatches,
  InvitationCloneError,
  listCloneFiles,
  loadCloneJson,
  writeCloneData,
  type CloneDriveFile,
} from './cloneDriveFiles';
import {
  isJsonRecord,
  kakaoFromSavedData,
  remapInvitationJson,
} from './cloneInvitationData';
import { cloneInProgress, withCloneLock } from './cloneInvitationLock';
import { buildInvitationFolderName } from './ensureInvitationFolder';
import {
  APP_IDENTIFIER,
  isShareUrlPayload,
  loadInvitationMetaByFileId,
  META_JSON_KIND,
  META_JSON_NAME,
  upsertInvitationMeta,
  type InvitationMetaPayload,
} from './ensureInvitationMetaFile';
import {
  THUMBNAIL_KIND,
  THUMBNAIL_NAME_PNG,
  THUMBNAIL_NAME_WEBP,
} from './ensureThumbnailFile';
import { generateUuid } from './generateUuid';
import { guestPath } from './guestReadiness';
import { assertInvitationFolderAccess } from './previewAccess';

const INVITATION_KIND = 'invitation';
const STAGING_KIND = 'invitation_clone_staging';
const DATA_NAME = 'data.json';
const DATA_KIND = 'invitation_data_json';
const LEGACY_KAKAO_NAME = 'kakao-share.json';
const LEGACY_KAKAO_KIND = 'kakao_share_json';
const ROOT_METADATA_NAMES = new Set([
  DATA_NAME,
  META_JSON_NAME,
  LEGACY_KAKAO_NAME,
]);
const SHORTCUT_MIME = 'application/vnd.google-apps.shortcut';
const STALE_STAGE_MS = 3 * 60 * 1000;
const ASSET_FOLDERS = [
  { name: 'images', kind: 'assets_images', legacyName: 'image' },
  { name: 'audios', kind: 'assets_audios', legacyName: 'audio' },
] as const;

function appProperties(kind: string) {
  return { app_id: APP_IDENTIFIER, kind };
}

function isThumbnail(file: CloneDriveFile) {
  return (
    file.mimeType.startsWith('image/') &&
    (file.name === THUMBNAIL_NAME_PNG || file.name === THUMBNAIL_NAME_WEBP)
  );
}

function findMeta(files: CloneDriveFile[]) {
  return (
    files.find(
      file =>
        file.name === META_JSON_NAME &&
        file.appProperties?.kind === META_JSON_KIND
    ) ??
    files.find(
      file => file.name === META_JSON_NAME && file.mimeType === DRIVE_JSON_MIME
    )
  );
}

function findData(files: CloneDriveFile[], preferredId?: string | null) {
  const candidates = files.filter(
    file =>
      file.name.toLowerCase() === DATA_NAME && file.mimeType.includes('json')
  );
  return (
    candidates.find(file => file.id === preferredId) ??
    candidates.find(file => file.appProperties?.kind === DATA_KIND) ??
    candidates[0]
  );
}

async function copyAssets(
  files: CloneDriveFile[],
  parentId: string,
  ids: Map<string, string>
) {
  const copyable = files.filter(file => file.mimeType !== SHORTCUT_MIME);
  const folders = copyable.filter(file => file.mimeType === DRIVE_FOLDER_MIME);
  const media = copyable.filter(file => file.mimeType !== DRIVE_FOLDER_MIME);

  await inCloneBatches(media, async file => {
    const copy = await copyCloneAsset(file, parentId);
    ids.set(file.id, copy.id);
  });

  for (const file of folders) {
    const folder = await createCloneFile({
      name: file.name,
      mimeType: file.mimeType,
      parentId,
      appProperties: file.appProperties,
    });
    ids.set(file.id, folder.id);
    await copyAssets(await listCloneFiles(file.id), folder.id, ids);
  }
}

async function copyRootAssets(
  files: CloneDriveFile[],
  parentId: string,
  ids: Map<string, string>
) {
  const consumed = new Set<string>();
  for (const role of ASSET_FOLDERS) {
    const matching = files.filter(
      file =>
        file.mimeType === DRIVE_FOLDER_MIME &&
        !consumed.has(file.id) &&
        (file.appProperties?.kind === role.kind ||
          (!ASSET_FOLDERS.some(
            asset => asset.kind === file.appProperties?.kind
          ) &&
            file.name.toLowerCase().includes(role.legacyName)))
    );
    const folder = await createCloneFile({
      name: role.name,
      mimeType: DRIVE_FOLDER_MIME,
      parentId,
      appProperties: appProperties(role.kind),
    });
    for (const sourceFolder of matching) {
      consumed.add(sourceFolder.id);
      ids.set(sourceFolder.id, folder.id);
      await copyAssets(await listCloneFiles(sourceFolder.id), folder.id, ids);
    }
  }

  // 기존 PNG와 WebP가 모두 있다면 대시보드에 표시되던 순서를 유지한다.
  let thumbnailId: string | undefined;
  for (const file of files.filter(isThumbnail)) {
    const copy = await copyCloneAsset(
      {
        ...file,
        appProperties: {
          ...file.appProperties,
          ...appProperties(THUMBNAIL_KIND),
        },
      },
      parentId
    );
    ids.set(file.id, copy.id);
    consumed.add(file.id);
    thumbnailId = copy.id;
  }

  await copyAssets(
    files.filter(file => !consumed.has(file.id)),
    parentId,
    ids
  );
  return thumbnailId;
}

function toInvite(
  folder: CloneDriveFile,
  meta: InvitationMetaPayload,
  thumbnailId?: string
): InviteListItem {
  return {
    folderId: folder.id,
    name: folder.name,
    createdTime: folder.createdTime,
    invitationUuid: folder.appProperties?.inv_id,
    dataJsonFileId: meta.dataJsonFileId ?? undefined,
    guestUrl: meta.guestUrl,
    published: meta.published,
    readiness: meta.published
      ? meta.guestUrl && meta.dataJsonFileId
        ? 'ready'
        : 'failed'
      : 'idle',
    thumbnailUrl: thumbnailId
      ? meta.published
        ? publicDriveFileUrl(thumbnailId)
        : previewDriveFileUrl(thumbnailId, { folderId: folder.id })
      : null,
    hasKakaoShareData: Boolean(meta.kakaoShare),
  };
}

async function resumeClone(folder: CloneDriveFile): Promise<InviteListItem> {
  const files = await listCloneFiles(folder.id);
  const metaFile = findMeta(files);
  if (!metaFile) throw cloneInProgress();
  const meta = await loadInvitationMetaByFileId(metaFile.id);
  if (!findData(files, meta.dataJsonFileId)) throw cloneInProgress();
  if (folder.appProperties?.kind === STAGING_KIND) {
    if (!meta.dataJsonFileId || !meta.guestUrl) throw cloneInProgress();
    await commitCloneFile(folder.id, {
      ...folder.appProperties,
      ...appProperties(INVITATION_KIND),
    });
  }
  const thumbnail = files.filter(isThumbnail).at(-1);
  return toInvite(folder, meta, thumbnail?.id);
}

async function cleanupStage(folderId: string) {
  try {
    await deleteCloneFile(folderId);
  } catch (error) {
    captureDriveError({ error, operation: 'drive_clone_cleanup' });
  }
}

export async function cloneInvitation(input: {
  folderId: string;
  requestId: string;
  publicOrigin: string;
}): Promise<InviteListItem> {
  const { folderId: sourceFolderId, requestId, publicOrigin } = input;
  const source = await assertInvitationFolderAccess(sourceFolderId, {
    ownedOnly: true,
  });
  const { workspaceFolderId } = source;
  const requestKey = createHash('sha256')
    .update(JSON.stringify([workspaceFolderId, sourceFolderId, requestId]))
    .digest('base64url');

  return withCloneLock(requestKey, async attempt => {
    const knownFolder = attempt.readyFolderId
      ? await getCloneFile(attempt.readyFolderId)
      : null;
    if (
      knownFolder &&
      !knownFolder.trashed &&
      knownFolder.parents?.includes(workspaceFolderId) &&
      knownFolder.appProperties?.clone_request === requestKey
    ) {
      return resumeClone(knownFolder);
    }

    const previous = await listCloneFiles(workspaceFolderId, [
      `appProperties has { key='clone_request' and value='${requestKey}' }`,
    ]);
    const completed = previous.find(
      file => file.appProperties?.kind === INVITATION_KIND
    );
    if (completed) return resumeClone(completed);
    for (const stage of previous.filter(
      file => file.appProperties?.kind === STAGING_KIND
    )) {
      if (Date.now() - Date.parse(stage.createdTime) < STALE_STAGE_MS) {
        throw cloneInProgress();
      }
      await cleanupStage(stage.id);
    }

    await assertWorkspacePrivate(workspaceFolderId);
    const files = await listCloneFiles(sourceFolderId);
    const sourceMetaFile = findMeta(files);
    const sourceMeta = sourceMetaFile
      ? await loadInvitationMetaByFileId(sourceMetaFile.id)
      : null;
    const legacyKakao = files.find(
      file =>
        file.name === LEGACY_KAKAO_NAME &&
        file.appProperties?.kind === LEGACY_KAKAO_KIND
    );
    const legacyKakaoData =
      !sourceMeta?.kakaoShare && legacyKakao
        ? await loadCloneJson(legacyKakao.id)
        : null;
    const sourceKakao =
      sourceMeta?.kakaoShare ??
      (isShareUrlPayload(legacyKakaoData) ? legacyKakaoData : null);
    const sourceData = findData(files, sourceMeta?.dataJsonFileId);
    if (!sourceData)
      throw new InvitationCloneError(
        '저장된 초대장 데이터를 찾을 수 없습니다.',
        404
      );
    const data = await loadCloneJson(sourceData.id);
    if (!isJsonRecord(data) || !parseGuestPayload(data).ok) {
      throw new InvitationCloneError(
        '저장된 초대장 데이터 형식을 확인해 주세요.',
        422
      );
    }

    const sourceName = source.name?.replace(
      / - \d{4}년 \d{2}월 \d{2}일 \d{2}시 \d{2}분$/,
      ''
    );
    const created = await createCloneFile({
      name: buildInvitationFolderName({
        baseName: `${sourceName || '초대장'} (복사본)`,
      }),
      mimeType: DRIVE_FOLDER_MIME,
      parentId: workspaceFolderId,
      appProperties: {
        ...appProperties(STAGING_KIND),
        inv_id: generateUuid(),
        clone_request: requestKey,
      },
    });

    let commitStarted = false;
    try {
      const newData = await createCloneFile({
        name: DATA_NAME,
        mimeType: DRIVE_JSON_MIME,
        parentId: created.id,
        appProperties: appProperties(DATA_KIND),
      });
      const ids = new Map([
        [sourceFolderId, created.id],
        [sourceData.id, newData.id],
      ]);
      const thumbnailId = await copyRootAssets(
        files.filter(file => !ROOT_METADATA_NAMES.has(file.name.toLowerCase())),
        created.id,
        ids
      );
      const guestUrl = new URL(guestPath(newData.id), publicOrigin).href;
      const options = {
        ids,
        sourceDataId: sourceData.id,
        sourceLinks: new Set(
          [sourceMeta?.guestUrl, sourceKakao?.invitationUrl].filter(
            (link): link is string => Boolean(link)
          )
        ),
        guestUrl,
      };
      const copyData = remapInvitationJson(data, options);
      const kakaoShare = sourceKakao
        ? remapInvitationJson(sourceKakao, options)
        : kakaoFromSavedData(copyData);
      await writeCloneData(newData.id, copyData);
      const { payload } = await upsertInvitationMeta(created.id, {
        guestUrl,
        dataJsonFileId: newData.id,
        published: false,
        kakaoShare: kakaoShare
          ? { ...kakaoShare, invitationUrl: guestUrl }
          : null,
      });

      await attempt.rememberReadyFolder(created.id);
      commitStarted = true;
      // 목록 노출에 사용하는 kind는 데이터와 에셋이 모두 저장된 뒤에 변경한다.
      await commitCloneFile(created.id, {
        ...created.appProperties,
        ...appProperties(INVITATION_KIND),
      });
      return toInvite(created, payload, thumbnailId);
    } catch (error) {
      // 마지막 PATCH의 결과를 알 수 없는 경우 이미 표시된 복제본을 지우지 않는다.
      if (!commitStarted) await cleanupStage(created.id);
      throw error;
    }
  });
}
