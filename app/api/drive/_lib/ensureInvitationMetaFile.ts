import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';

export const APP_IDENTIFIER = 'Bread-Barbershop';
export const META_JSON_NAME = 'meta.json';
export const META_JSON_KIND = 'invitation_meta_json';
export const META_JSON_VERSION = 1;

export type ShareUrlPayload = {
  title: string;
  description: string;
  imageFileId?: string;
  showLocationButton: boolean;
  invitationUrl?: string;
  locationInfo?: {
    lat: number;
    lng: number;
    placeName: string;
  };
};

export type InvitationMetaPayload = {
  version: typeof META_JSON_VERSION;
  published: boolean;
  guestUrl: string | null;
  dataJsonFileId: string | null;
  kakaoShare: ShareUrlPayload | null;
  updatedAt: string;
};

export type EnsureInvitationMetaFileResult = {
  metaFileId: string;
  reused: boolean;
  payload: InvitationMetaPayload;
};

type DriveFile = {
  id?: string;
};

type DriveSearchResponse = {
  files?: DriveFile[];
  error?: unknown;
};

function createDefaultMeta(): InvitationMetaPayload {
  return {
    version: META_JSON_VERSION,
    published: false,
    guestUrl: null,
    dataJsonFileId: null,
    kakaoShare: null,
    updatedAt: new Date().toISOString(),
  };
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function isShareUrlPayload(value: unknown): value is ShareUrlPayload {
  if (value === null) return false;
  if (typeof value !== 'object') return false;

  const payload = value as Partial<ShareUrlPayload>;
  return (
    typeof payload.title === 'string' &&
    typeof payload.description === 'string' &&
    typeof payload.showLocationButton === 'boolean'
  );
}

function normalizeMetaPayload(value: unknown): InvitationMetaPayload {
  const defaults = createDefaultMeta();

  if (typeof value !== 'object' || value === null) {
    return defaults;
  }

  const candidate = value as Partial<InvitationMetaPayload>;

  return {
    version: META_JSON_VERSION,
    published:
      typeof candidate.published === 'boolean'
        ? candidate.published
        : defaults.published,
    guestUrl: isStringOrNull(candidate.guestUrl)
      ? candidate.guestUrl
      : defaults.guestUrl,
    dataJsonFileId: isStringOrNull(candidate.dataJsonFileId)
      ? candidate.dataJsonFileId
      : defaults.dataJsonFileId,
    kakaoShare: isShareUrlPayload(candidate.kakaoShare)
      ? candidate.kakaoShare
      : defaults.kakaoShare,
    updatedAt:
      typeof candidate.updatedAt === 'string'
        ? candidate.updatedAt
        : defaults.updatedAt,
  };
}

function createMetaQuery(invitationFolderId: string) {
  return [
    `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
    `appProperties has { key='kind' and value='${escapeDriveQueryValue(
      META_JSON_KIND
    )}' }`,
    `name='${escapeDriveQueryValue(META_JSON_NAME)}'`,
  ].join(' and ');
}

async function findMetaFileId(
  invitationFolderId: string
): Promise<string | null> {
  const searchParams = new URLSearchParams({
    q: createMetaQuery(invitationFolderId),
    spaces: 'drive',
    fields: 'files(id)',
    orderBy: 'createdTime',
    pageSize: '1',
  });

  const searchRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
    { cache: 'no-store' }
  );
  const searchData = (await searchRes
    .json()
    .catch(() => ({}))) as DriveSearchResponse;

  if (!searchRes.ok) {
    throw new DriveHttpError(
      'meta.json search failed',
      searchRes.status,
      searchData
    );
  }

  return searchData.files?.[0]?.id ?? null;
}

export async function loadInvitationMetaByFileId(
  metaFileId: string
): Promise<InvitationMetaPayload> {
  const contentRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      metaFileId
    )}?alt=media`,
    { cache: 'no-store' }
  );

  if (!contentRes.ok) {
    throw new DriveHttpError(
      'meta.json load failed',
      contentRes.status,
      await contentRes.json().catch(() => ({}))
    );
  }

  return normalizeMetaPayload(await contentRes.json().catch(() => null));
}

export async function loadInvitationMeta(
  invitationFolderId: string
): Promise<{ metaFileId: string; payload: InvitationMetaPayload } | null> {
  if (!invitationFolderId) {
    throw new DriveHttpError('invitationFolderId is required', 400, {
      invitationFolderId,
    });
  }

  const metaFileId = await findMetaFileId(invitationFolderId);
  if (!metaFileId) return null;

  return {
    metaFileId,
    payload: await loadInvitationMetaByFileId(metaFileId),
  };
}

async function createMetaFile(
  invitationFolderId: string,
  payload: InvitationMetaPayload
): Promise<string> {
  const createRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: META_JSON_NAME,
        mimeType: 'application/json',
        parents: [invitationFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: META_JSON_KIND,
        },
      }),
    }
  );

  const created = (await createRes.json().catch(() => ({}))) as {
    id?: string;
  };

  if (!createRes.ok || !created.id) {
    throw new DriveHttpError(
      'meta.json create failed',
      createRes.status,
      created
    );
  }

  await updateMetaFile(created.id, payload);
  return created.id;
}

async function updateMetaFile(
  metaFileId: string,
  payload: InvitationMetaPayload
) {
  const updateRes = await googleFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      metaFileId
    )}?uploadType=media&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(payload),
    }
  );

  if (!updateRes.ok) {
    throw new DriveHttpError(
      'meta.json update failed',
      updateRes.status,
      await updateRes.json().catch(() => ({}))
    );
  }
}

export async function upsertInvitationMeta(
  invitationFolderId: string,
  patch: Partial<Omit<InvitationMetaPayload, 'version' | 'updatedAt'>>
): Promise<EnsureInvitationMetaFileResult> {
  if (!invitationFolderId) {
    throw new DriveHttpError('invitationFolderId is required', 400, {
      invitationFolderId,
    });
  }

  const existing = await loadInvitationMeta(invitationFolderId);
  const payload: InvitationMetaPayload = {
    ...(existing?.payload ?? createDefaultMeta()),
    ...patch,
    version: META_JSON_VERSION,
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    await updateMetaFile(existing.metaFileId, payload);
    return { metaFileId: existing.metaFileId, reused: true, payload };
  }

  const metaFileId = await createMetaFile(invitationFolderId, payload);
  return { metaFileId, reused: false, payload };
}
