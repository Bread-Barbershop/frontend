import { StateCreator } from 'zustand';

import { EditorState, DriveSlice } from '@/shared/types/block';

export const createDriveSlice: StateCreator<
  EditorState,
  [],
  [],
  DriveSlice
> = set => ({
  invitationFolderId: '',
  invitationUuid: '',
  audioFolderId: '',
  imageFolderId: '',
  hashFiles: [],
  cleanUpFiles: [],
  setInvitationFolderId: (id: string) => set({ invitationFolderId: id }),
  setInvitationUuid: (uuid: string) => set({ invitationUuid: uuid }),
  setAudioFolderId: (id: string) => set({ audioFolderId: id }),
  setImageFolderId: (id: string) => set({ imageFolderId: id }),
  setHashFiles: (hash: string) => set(state => ({ hashFiles: [...state.hashFiles, hash] })),
  setCleanUpFiles: (fileId: string) => set(state => ({ cleanUpFiles: [...state.cleanUpFiles, fileId] })),
  clearHashFiles: () => set({ hashFiles: [] }),
  clearCleanUpFiles: () => set({ cleanUpFiles: [] }),
});
