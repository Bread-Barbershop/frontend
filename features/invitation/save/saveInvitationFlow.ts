import type { PersistedEditorBlock, ShareUrlState } from '@/shared/types/block';
import type {
  BgmData,
  BulkJson,
  InvitationPayload,
  InvitationThumbnail,
  MainPosterData,
  UploadTask,
} from '@/shared/types/invitationSave';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '@/shared/utils/shareUrlDefaults';

import { retryFailedOnce } from './retryFailedOnce';
import { retryPatchFailedOnce } from './retryPatchFailedOnce';
import { updateFileToDrive } from './updateFileToDrive';
import {
  uploadAllSettled,
  type UploadFail,
  type UploadOk,
} from './uploadAllSettled';

type SaveInvitationPrepareResponse = {
  workspaceFolderId: string;
  invitationFolderId: string;
  invitationUuid: string;
  dataJsonFileId: string;
  imageFolderId: string;
  audioFolderId: string;
  accessToken: string;
  expiresAt: string | number;
  meta?: unknown;
};

type BatchResult = { ok: UploadOk[]; fail: UploadFail[] };

type SaveInvitationFlowParams = {
  bulkData: BulkJson;
  images: UploadTask[];
  audio: File | null;
  data: PersistedEditorBlock[];
  shareUrl: ShareUrlState;
  bgmData: BgmData;
  invitationUuid?: string;
  mainPoster: MainPosterData;
  invitationThumbnail: InvitationThumbnail;
};

type SaveInvitationFlowResult = {
  success: boolean;
  invitationUuid: string;
  results: {
    images: BatchResult;
    audio: BatchResult;
    data: BatchResult;
  };
  folders: {
    workspaceFolderId: string;
    invitationFolderId: string;
    imageFolderId: string;
    audioFolderId: string;
  };
  debug: {
    refreshedToken: boolean;
    usedAccessToken: string;
  };
};

type StepResult = {
  final: BatchResult;
  usedAccessToken: string;
};

type TokenState = {
  currentToken: string;
  refreshedToken: boolean;
  refreshAccessToken: () => Promise<string>;
};

type UploadResult = {
  imagesStep: StepResult;
  audioStep: StepResult;
  fileToId: Map<File, string>;
  uploadedAudioFileId: string | null;
};

type CommitResult = {
  dataStep: StepResult;
  thumbnailSaveFailed: boolean;
};

async function prepare(
  invitationUuid: string | undefined
): Promise<SaveInvitationPrepareResponse> {
  const prepRes = await fetch('/api/drive/saveInvitation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitationUuid }),
  });

  if (!prepRes.ok) {
    throw new Error(`saveInvitation prepare failed: ${prepRes.status}`);
  }

  return (await prepRes.json()) as SaveInvitationPrepareResponse;
}

function createTokenState(prep: SaveInvitationPrepareResponse): TokenState {
  const token: TokenState = {
    currentToken: prep.accessToken,
    refreshedToken: false,
    refreshAccessToken: async () => {
      const r = await fetch('/api/drive/getToken', { method: 'POST' });
      if (!r.ok) throw new Error(`refresh-token failed: ${r.status}`);
      const j = await r.json();

      token.currentToken = j.accessToken as string;
      token.refreshedToken = true;

      return token.currentToken;
    },
  };

  return token;
}

async function upload(params: {
  prep: SaveInvitationPrepareResponse;
  images: UploadTask[];
  audio: File | null;
  token: TokenState;
}): Promise<UploadResult> {
  const { prep, images, audio, token } = params;

  const runUploadStep = async (step: {
    folderId: string;
    originFile: UploadTask[];
    concurrency?: number;
  }): Promise<StepResult> => {
    if (step.originFile.length === 0) {
      return {
        final: { ok: [], fail: [] },
        usedAccessToken: token.currentToken,
      };
    }

    const firstAttempt = await uploadAllSettled({
      originFile: step.originFile,
      folderId: step.folderId,
      accessToken: token.currentToken,
      concurrency: step.concurrency,
    });

    const retryAttempt = firstAttempt.fail.length
      ? await retryFailedOnce({
          failures: firstAttempt.fail,
          folderId: step.folderId,
          accessToken: token.currentToken,
          refreshAccessToken: token.refreshAccessToken,
        })
      : {
          ok: [],
          fail: [],
          refreshedToken: false,
          usedAccessToken: token.currentToken,
        };

    if (retryAttempt.refreshedToken) {
      token.currentToken = retryAttempt.usedAccessToken;
    }

    return {
      final: {
        ok: [...firstAttempt.ok, ...retryAttempt.ok],
        fail: retryAttempt.fail,
      },
      usedAccessToken: token.currentToken,
    };
  };

  const imagesStep = await runUploadStep({
    originFile: images,
    folderId: prep.imageFolderId,
    concurrency: 5,
  });

  const fileToId = new Map<File, string>();
  imagesStep.final.ok.forEach(ok => {
    fileToId.set(ok.file, ok.fileId);
  });

  const audioStep = await runUploadStep({
    originFile: audio ? [{ id: 'bgm', file: audio }] : [],
    folderId: prep.audioFolderId,
  });

  return {
    imagesStep,
    audioStep,
    fileToId,
    uploadedAudioFileId: audioStep.final.ok[0]?.fileId ?? null,
  };
}

async function commit(params: {
  prep: SaveInvitationPrepareResponse;
  token: TokenState;
  uploadResult: UploadResult;
  bulkData: BulkJson;
  images: UploadTask[];
  data: PersistedEditorBlock[];
  shareUrl: ShareUrlState;
  bgmData: BgmData;
  mainPoster: MainPosterData;
  invitationThumbnail: InvitationThumbnail;
}): Promise<CommitResult> {
  const {
    prep,
    token,
    uploadResult,
    bulkData,
    images,
    data,
    shareUrl,
    bgmData,
    mainPoster,
    invitationThumbnail,
  } = params;
  const { fileToId, uploadedAudioFileId } = uploadResult;

  const invitationUrl = `${window.location.origin}/guest/${prep.dataJsonFileId}`;

  const normalizedShareUrl: ShareUrlState = {
    ...shareUrl,
    title: shareUrl.title?.trim() || DEFAULT_TITLE,
    description: shareUrl.description?.trim() || DEFAULT_DESCRIPTION,
    urlTitle: shareUrl.urlTitle?.trim() || DEFAULT_TITLE,
    urlDescription: shareUrl.urlDescription?.trim() || DEFAULT_DESCRIPTION,
  };

  const replaceFiles = (obj: unknown): unknown => {
    if (obj instanceof File) {
      const fileId = fileToId.get(obj);
      if (!fileId) {
        console.warn('File not uploaded, skipping:', obj.name);
        throw new Error(`not Found Image FileId: ${obj.name}`);
      }
      return fileId;
    }
    if (Array.isArray(obj)) {
      return obj.map(replaceFiles);
    }
    if (obj !== null && typeof obj === 'object') {
      const newObj: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = replaceFiles(value);
      }
      return newObj;
    }
    return obj;
  };

  const replacedShareUrl = replaceFiles(normalizedShareUrl) as ShareUrlState;
  const newData = data.map(item => ({
    ...item,
    props: replaceFiles(item.props) as typeof item.props,
  }));

  const isUserBgmSelected = bgmData.selectedBgmId === 'user-bgm';

  const finalBgm: BgmData = {
    ...bgmData,
    userBgmFileId: isUserBgmSelected
      ? (uploadedAudioFileId ?? bgmData.userBgmFileId ?? null)
      : null,
  };

  const payload: InvitationPayload = {
    bulkData,
    blocks: newData,
    shareUrl: replacedShareUrl,
    bgm: finalBgm,
    mainPoster,
    invitationImage: images,
  };

  const dataFile = new File([JSON.stringify(payload)], 'data.json', {
    type: 'application/json',
  });

  const dataFirstAttempt: BatchResult = await (async () => {
    try {
      const result = await updateFileToDrive(
        dataFile,
        prep.dataJsonFileId,
        token.currentToken
      );
      return {
        ok: [{ file: dataFile, ...result } satisfies UploadOk],
        fail: [],
      };
    } catch (error) {
      return { ok: [], fail: [{ file: dataFile, error }] };
    }
  })();

  const dataRetryAttempt = await retryPatchFailedOnce({
    failures: dataFirstAttempt.fail,
    fileId: prep.dataJsonFileId,
    accessToken: token.currentToken,
    refreshAccessToken: token.refreshAccessToken,
  });

  if (dataRetryAttempt.refreshedToken) {
    token.currentToken = dataRetryAttempt.usedAccessToken;
  }

  const dataStep: StepResult = {
    final: {
      ok: [...dataFirstAttempt.ok, ...dataRetryAttempt.ok],
      fail: dataRetryAttempt.fail,
    },
    usedAccessToken: token.currentToken,
  };

  try {
    const primaryImage =
      normalizedShareUrl.images?.[0] ?? normalizedShareUrl.urlImage?.[0];

    const imageFileId =
      typeof primaryImage === 'string'
        ? primaryImage
        : primaryImage instanceof File
          ? fileToId.get(primaryImage)
          : undefined;

    await fetch('/api/drive/shareUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationFolderId: prep.invitationFolderId,
        shareData: {
          title: normalizedShareUrl.title,
          description: normalizedShareUrl.description,
          imageFileId,
          showLocationButton: normalizedShareUrl.showLocationButton,
          showShareButton: normalizedShareUrl.showShareButton,
          invitationUrl,
          locationInfo: normalizedShareUrl.locationInfo,
        },
      }),
    });
  } catch (error) {
    console.error('Share data save failed:', error);
  }

  let thumbnailSaveFailed = false;
  if (invitationThumbnail && invitationThumbnail.dataUrl) {
    try {
      const thumbnailResponse = await fetch('/api/drive/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationFolderId: prep.invitationFolderId,
          thumbnailData: invitationThumbnail,
        }),
      });
      if (!thumbnailResponse.ok) {
        throw new Error(`thumbnail save failed: ${thumbnailResponse.status}`);
      }
    } catch (error) {
      thumbnailSaveFailed = true;
      console.error('Thumbnail save failed:', error);
    }
  }

  return {
    dataStep,
    thumbnailSaveFailed,
  };
}

export async function saveInvitationFlow(
  params: SaveInvitationFlowParams
): Promise<SaveInvitationFlowResult> {
  const {
    bulkData,
    images,
    audio,
    data,
    shareUrl,
    bgmData,
    invitationUuid,
    mainPoster,
    invitationThumbnail,
  } = params;

  const prep = await prepare(invitationUuid);
  const token = createTokenState(prep);
  const uploadResult = await upload({ prep, images, audio, token });
  const commitResult = await commit({
    prep,
    token,
    uploadResult,
    bulkData,
    images,
    data,
    shareUrl,
    bgmData,
    mainPoster,
    invitationThumbnail,
  });

  const totalFailed =
    uploadResult.imagesStep.final.fail.length +
    uploadResult.audioStep.final.fail.length +
    commitResult.dataStep.final.fail.length +
    (commitResult.thumbnailSaveFailed ? 1 : 0);

  return {
    success: totalFailed === 0,
    invitationUuid: prep.invitationUuid,
    results: {
      images: uploadResult.imagesStep.final,
      audio: uploadResult.audioStep.final,
      data: commitResult.dataStep.final,
    },
    folders: {
      workspaceFolderId: prep.workspaceFolderId,
      invitationFolderId: prep.invitationFolderId,
      imageFolderId: prep.imageFolderId,
      audioFolderId: prep.audioFolderId,
    },
    debug: {
      refreshedToken: token.refreshedToken,
      usedAccessToken: token.currentToken,
    },
  };
}
