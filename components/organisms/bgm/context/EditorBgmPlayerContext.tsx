'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useShallow } from 'zustand/shallow';

import { BGM_LIST } from '../data/bgmList';
import { useBgmPlayer } from '../hooks/useBgmPlayer';
import { USER_BGM_ID } from '../hooks/useUserBgmUpload';
import { useBgmStore } from '../store/useBgmStore';

type EditorBgmPlayerValue = ReturnType<typeof useBgmPlayer> & {
  hasSelectedBgm: boolean;
  sourceKey: string | null;
};

const EditorBgmPlayerContext = createContext<EditorBgmPlayerValue | null>(null);

export function EditorBgmPlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { selectedBgmId, userFileSrc } = useBgmStore(
    useShallow(state => ({
      selectedBgmId: state.selectedBgmId,
      userFileSrc: state.userFileSrc,
    }))
  );

  const currentSrc = useMemo(() => {
    if (!selectedBgmId) return null;
    if (selectedBgmId === USER_BGM_ID) return userFileSrc;
    return BGM_LIST.find(bgm => bgm.id === selectedBgmId)?.src ?? null;
  }, [selectedBgmId, userFileSrc]);

  const player = useBgmPlayer(currentSrc);

  return (
    <EditorBgmPlayerContext.Provider
      value={{
        ...player,
        hasSelectedBgm: currentSrc !== null,
        sourceKey: currentSrc,
      }}
    >
      {children}
    </EditorBgmPlayerContext.Provider>
  );
}

export function useEditorBgmPlayer() {
  const context = useContext(EditorBgmPlayerContext);

  if (!context) {
    throw new Error(
      'useEditorBgmPlayer must be used within EditorBgmPlayerProvider'
    );
  }

  return context;
}
