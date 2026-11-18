/* global jest */
import { create } from 'zustand';

export const recoveredEditor = {
  block: [],
  images: [],
  backgroundColor: '#ffffff',
  titleData: {},
  bodyData: {},
  isZoom: false,
  shareUrl: {},
  invitationUuid: 'recovered-uuid',
  invitationFolderId: '',
  imageFolderId: '',
  audioFolderId: '',
  hashFiles: [],
  cleanUpFiles: [],
  isDirty: true,
};
export const editorTestStore = create<
  typeof recoveredEditor & { setInvitationUuid: (id: string) => void }
>(set => ({
  ...recoveredEditor,
  invitationUuid: 'current-uuid',
  setInvitationUuid: invitationUuid => set({ invitationUuid }),
}));
const bgmInitial = {
  selectedBgmId: null as string | null,
  isLoop: false,
  volume: 0.2,
  userFile: null as File | null,
  userFileName: null as string | null,
  userDuration: null as string | null,
  audioFileId: null as string | null,
};
export const bgmTestStore = create<
  typeof bgmInitial & {
    reset: () => void;
    setUserFile: (file: File, name: string, duration: string) => void;
  }
>(set => ({
  ...bgmInitial,
  reset: () => set(bgmInitial),
  setUserFile: (userFile, userFileName, userDuration) =>
    set({ userFile, userFileName, userDuration }),
}));
export const canvasFixture = {
  toObject: jest.fn(() => ({ objects: [] })),
  loadFromJSON: jest.fn(async () => undefined),
  on: jest.fn(),
  off: jest.fn(),
  requestRenderAll: jest.fn(),
};
export const fabricFixture = {
  canvas: canvasFixture,
  initialData: '{}',
  runHistoryTransaction: async (run: () => Promise<void>) => run(),
};
