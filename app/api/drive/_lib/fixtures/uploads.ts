import type { UploadJournal } from '../../uploadSession/route';

export const uploadRequestFixture = {
  folderId: 'images',
  name: 'wedding.jpg',
  mimeType: 'image/jpeg',
  size: 1234,
  digest: 'a'.repeat(64),
};
export const uploadUrlFixture =
  'https://www.googleapis.com/upload/drive/v3/files?upload_id=fake-session';
export const uploadIdFixture = 'b'.repeat(64);
export const invitationPayloadFixture = {
  blocks: [
    { props: { html: '<p>초대합니다<img src=x onerror="alert(1)"></p>' } },
  ],
  bulkData: {},
  mainPoster: { objects: [] },
};
export const dataJsonAccessFixture = {
  file: {
    id: 'canonical-data',
    name: 'data.json',
    mimeType: 'application/json',
    appProperties: { app_id: 'Bread-Barbershop', kind: 'invitation_data_json' },
  },
  invitationFolderId: 'invitation',
  invitation: { appProperties: { inv_id: 'uuid' } },
};
export const uploadJournalFixture: UploadJournal = {
  fileId: 'allocated-file',
  folderId: 'images',
  name: 'wedding.jpg',
  mimeType: 'image/jpeg',
  size: 1234,
  createdAt: 0,
};
