'use client'

import { create } from 'zustand'

interface BgmState {
  selectedBgmId: string | null;  // 선택된 프리셋 BGM id
  isLoop: boolean;                // 반복재생 여부
  volume: number;                 // 볼륨
  userFile: File | null;          // 사용자 업로드 파일 (Object URL은 훅에서 파생)
  userFileName: string | null;    // 표시용 파일명
  userDuration: string | null;    // 표시용 재생시간
  audioFileId: string | null;     // 구글 드라이브 파일 id (추후 연동용)
}

interface BgmActions {
  setSelectedBgmId: (id: string | null) => void;
  setIsLoop: (isLoop: boolean) => void;
  setVolume: (volume: number) => void;
  setUserFile: (file: File, fileName: string, duration: string) => void;
  clearUserFile: () => void;
  reset: () => void;
}

type Store = BgmState & BgmActions

const initialState: BgmState = {
  selectedBgmId: null,
  isLoop: false,
  volume: 0.2,
  userFile: null,
  userFileName: null,
  userDuration: null,
  audioFileId: null,
}

export const useBgmStore = create<Store>((set) => ({
  ...initialState,

  setSelectedBgmId: (id) => set({ selectedBgmId: id }),
  setIsLoop: (isLoop) => set({ isLoop }),
  setVolume: (volume) => set({ volume }),

  // 음원파일 메타데이터를 함께 저장
  setUserFile: (file, fileName, duration) =>
    set({ userFile: file, userFileName: fileName, userDuration: duration }),

  clearUserFile: () =>
    set({ userFile: null, userFileName: null, userDuration: null }),

  reset: () => set(initialState),
}))