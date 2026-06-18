'use client';

import { createContext, useContext } from 'react';

import type { ReactNode } from 'react';

export type DriveImageResolveMode = 'public' | 'dashboard-preview';

export type DriveImageResolveContextValue = {
  mode: DriveImageResolveMode;
  folderId?: string;
};

const DriveImageResolveModeContext = createContext<DriveImageResolveContextValue>(
  {
    mode: 'public',
  }
);

// 게스트 페이지는 공개 Drive URL을 쓰고, 대시보드 미리보기는 인증 프록시 URL을 쓰도록 하위 이미지 hook에 모드를 전달한다.
export function DriveImageResolveModeProvider({
  mode,
  folderId,
  children,
}: {
  mode: DriveImageResolveMode;
  folderId?: string;
  children: ReactNode;
}) {
  return (
    <DriveImageResolveModeContext.Provider value={{ mode, folderId }}>
      {children}
    </DriveImageResolveModeContext.Provider>
  );
}

export function useDriveImageResolveContext() {
  return useContext(DriveImageResolveModeContext);
}

export function useDriveImageResolveMode() {
  return useContext(DriveImageResolveModeContext).mode;
}
