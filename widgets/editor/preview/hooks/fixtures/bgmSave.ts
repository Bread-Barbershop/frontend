import type { InvitationPayload } from '@/shared/types/invitationSave';

export function mockBgmSaveApi(input: RequestInfo | URL, init?: RequestInit) {
  let body: Record<string, unknown>;
  if (input === '/api/drive/saveInvitation') {
    const uuid = JSON.parse(String(init?.body)).invitationUuid ?? 'invitation';
    body = {
      workspaceFolderId: 'workspace',
      invitationUuid: uuid,
      invitationFolderId: uuid,
      audioFolderId: `${uuid}-audio`,
      imageFolderId: `${uuid}-images`,
      dataJsonFileId: `${uuid}-data`,
      accessToken: 'test',
      expiresAt: Date.now() + 600_000,
    };
  } else if (
    input === '/api/drive/shareUrl' ||
    input === '/api/drive/invitationVisibility'
  ) {
    body = { ok: true, guestUrl: '/i/test', published: true, ready: true };
  } else {
    throw new Error(`Unexpected request: ${input}`);
  }
  return Promise.resolve({ ok: true, json: async () => body } as Response);
}

export function readInvitationPayload(file: File): Promise<InvitationPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(JSON.parse(String(reader.result)));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
