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
export const uploadJournalFixture: UploadJournal = {
  fileId: 'allocated-file',
  folderId: 'images',
  name: 'wedding.jpg',
  mimeType: 'image/jpeg',
  size: 1234,
  createdAt: 0,
};
