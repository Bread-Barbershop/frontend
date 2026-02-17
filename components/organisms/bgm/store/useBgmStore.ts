'use client'

import { create } from 'zustand'

//bgm 상태 타입
interface BgmState {
  selectedBgmId: string | null; // 프리셋 음원 id
  isLoop: boolean; // 반복재생 여부
  volume: number; // 볼륨
  userFile: File | null; // 유저음원
  userFileName: string | null; // 유저음원 이름
  userDuration: string | null; // 유저음원 재생시간
  audioFileId: string | null; // 구글 드라이브 파일 id
}

// bgm 액션 타입
interface BgmActions {
  reset: () => void
}

type Store = BgmState & BgmActions

const initialState: BgmState = {
  selectedBgmId: null, // 프리셋 음원 id
  isLoop: false, // 반복재생 여부
  volume: 0.2, // 볼륨
  userFile: null, // 유저음원
  userFileName: null, // 유저음원 이름
  userDuration: null, // 유저음원 재생시간
  audioFileId: null, // 구글 드라이브 파일 id
}

export const useBgmStore = create<Store>((set) => ({
  ...initialState,


  // bgm state 초기화.
  reset: () =>
    set(initialState),
}))