/**
 * @jest-environment node
 */

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/ensureDataJsonFile', () => ({
  ensureDataJsonFile: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/ensureInvitationMetaFile', () => ({
  upsertInvitationMeta: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/publishPermissionWithRetry', () => ({
  publishPermissionWithRetry: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/revokePublicPermissionWithRetry', () => ({
  revokePublicPermissionWithRetry: jest.fn(),
}));

import { POST } from '@/app/api/drive/invitationVisibility/route';
import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import { upsertInvitationMeta } from '@/app/api/drive/_lib/ensureInvitationMetaFile';
import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';
import { revokePublicPermissionWithRetry } from '@/app/api/drive/_lib/revokePublicPermissionWithRetry';

const validGuestPayload = {
  bulkData: {
    backgroundColor: '#ffffff',
    titleData: {
      font: 'font-lineseed',
      fontSize: '20px',
      fontWeight: '700',
      color: '#FA7564',
      bold: false,
      underline: false,
      italic: false,
      align: 'center',
      isDefault: false,
    },
    bodyData: {
      font: 'font-lineseed',
      fontSize: '16px',
      fontWeight: '500',
      color: '#222222',
      bold: false,
      underline: false,
      italic: false,
      align: 'left',
      isDefault: false,
    },
    isZoom: false,
  },
  blocks: [],
  bgm: {
    selectedBgmId: null,
    isLoop: false,
    volume: 0.2,
    userBgmTitle: null,
    userBgmDuration: null,
    userBgmFileId: null,
  },
  mainPoster: {
    version: '7.1.0',
    objects: [],
  },
};

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function createRequest(visible: boolean) {
  return new Request('http://localhost/api/drive/invitationVisibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invitationFolderId: 'invitation-folder-id',
      visible,
    }),
  });
}

describe('invitationVisibility route', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
    global.fetch = mockFetch as unknown as typeof fetch;

    (ensureDataJsonFile as jest.Mock).mockResolvedValue({
      dataJsonFileId: 'data-json-file-id',
    });
    (upsertInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('publishes an invitation and stores meta.json', async () => {
    (publishPermissionWithRetry as jest.Mock).mockResolvedValue({
      ok: true,
      attempt: 1,
    });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
    });

    const res = await POST(createRequest(true));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      published: true,
      ready: true,
      guestUrl: '/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
    });
    expect(publishPermissionWithRetry).toHaveBeenCalledWith(
      'invitation-folder-id'
    );
    expect(upsertInvitationMeta).toHaveBeenCalledWith('invitation-folder-id', {
      published: true,
      guestUrl: '/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
    });
  });

  it('privatizes an invitation and stores meta.json', async () => {
    (revokePublicPermissionWithRetry as jest.Mock).mockResolvedValue({
      ok: true,
      attempt: 1,
    });

    const res = await POST(createRequest(false));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      published: false,
      ready: false,
      guestUrl: '/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
    });
    expect(revokePublicPermissionWithRetry).toHaveBeenCalledWith(
      'invitation-folder-id'
    );
    expect(upsertInvitationMeta).toHaveBeenCalledWith('invitation-folder-id', {
      published: false,
      guestUrl: '/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
