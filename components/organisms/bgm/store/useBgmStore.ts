'use client';

import { create } from 'zustand';

interface BgmState {
  selectedBgmId: string | null;
  isLoop: boolean;
  volume: number;
  userFile: File | null;
  userFileSrc: string | null;
  userFileName: string | null;
  userDuration: string | null;
  audioFileId: string | null;
}

interface BgmActions {
  setSelectedBgmId: (id: string | null) => void;
  setIsLoop: (isLoop: boolean) => void;
  setVolume: (volume: number) => void;
  setUserFile: (file: File, fileName: string, duration: string) => void;
  clearUserFile: () => void;
  reset: () => void;
}

type Store = BgmState & BgmActions;

const initialState: BgmState = {
  selectedBgmId: null,
  isLoop: false,
  volume: 0.2,
  userFile: null,
  userFileSrc: null,
  userFileName: null,
  userDuration: null,
  audioFileId: null,
};

export const useBgmStore = create<Store>(set => ({
  ...initialState,

  setSelectedBgmId: id => set({ selectedBgmId: id }),
  setIsLoop: isLoop => set({ isLoop }),
  setVolume: volume => set({ volume }),

  setUserFile: (file, fileName, duration) =>
    set(state => {
      if (state.userFileSrc) URL.revokeObjectURL(state.userFileSrc);

      return {
        userFile: file,
        userFileSrc: URL.createObjectURL(file),
        userFileName: fileName,
        userDuration: duration,
      };
    }),

  clearUserFile: () =>
    set(state => {
      if (state.userFileSrc) URL.revokeObjectURL(state.userFileSrc);

      return {
        userFile: null,
        userFileSrc: null,
        userFileName: null,
        userDuration: null,
      };
    }),

  reset: () =>
    set(state => {
      if (state.userFileSrc) URL.revokeObjectURL(state.userFileSrc);
      return initialState;
    }),
}));
