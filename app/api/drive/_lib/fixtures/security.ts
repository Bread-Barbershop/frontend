import type { ManagedDriveFile } from '../driveAccess';

const FOLDER = 'application/vnd.google-apps.folder';
export function managedDriveFixture(): Record<string, ManagedDriveFile> {
  return {
    root: {
      id: 'root',
      name: '내 드라이브',
      mimeType: FOLDER,
      ownedByMe: true,
    },
    workspace: {
      id: 'workspace',
      name: '모바일 초대장 invia',
      mimeType: FOLDER,
      ownedByMe: true,
      appProperties: { app_id: 'Bread-Barbershop' },
    },
    invitation: {
      id: 'invitation',
      name: '초대장',
      mimeType: FOLDER,
      ownedByMe: true,
      parents: ['workspace'],
      appProperties: {
        app_id: 'Bread-Barbershop',
        kind: 'invitation',
        inv_id: 'uuid',
      },
    },
    images: {
      id: 'images',
      name: 'images',
      mimeType: FOLDER,
      ownedByMe: true,
      parents: ['invitation'],
      appProperties: { app_id: 'Bread-Barbershop', kind: 'assets_images' },
    },
    photo: {
      id: 'photo',
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      ownedByMe: true,
      parents: ['images'],
    },
    unrelated: {
      id: 'unrelated',
      name: 'data.json',
      mimeType: 'application/json',
      ownedByMe: true,
      parents: ['root'],
    },
    impersonator: {
      id: 'impersonator',
      name: '초대장',
      mimeType: FOLDER,
      ownedByMe: true,
      parents: ['workspace'],
    },
  };
}

export const preparedFixture = {
  workspaceFolderId: 'workspace',
  invitationFolderId: 'invitation',
  invitationUuid: 'uuid',
  dataJsonFileId: 'data',
  imageFolderId: 'images',
  audioFolderId: 'audios',
};
