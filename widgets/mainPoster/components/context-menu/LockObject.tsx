import { cn } from '@/shared/utils/cn';

import { useFabricContext } from '../../context/FabricContext';
import { FabricObjectWithLock } from '../../types/fabric';

import { ActiveStyle, DisabledStyle, DisabledShortCutStyle } from './style';

interface Props {
  onClick: () => void;
}

export const LockObject = ({ onClick }: Props) => {
  const { canvas, lock, unLock, activeInfo } = useFabricContext();
  const hasActiveObject = activeInfo.type !== null;
  const activeObject = canvas?.getActiveObject() as FabricObjectWithLock;

  const isLocked = activeInfo.isLocked;

  const canLock = hasActiveObject && !isLocked;
  const canUnlock = hasActiveObject && isLocked;

  return (
    <>
      <button
        type="button"
        disabled={!canLock}
        className={cn(ActiveStyle, !canLock && DisabledStyle)}
        onClick={() => {
          if (canLock && activeObject) {
            lock(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!canLock && DisabledStyle)}>위치 잠그기</p>
        <p className={cn(!canLock && DisabledShortCutStyle)}>Ctrl + L</p>
      </button>
      <button
        type="button"
        disabled={!canUnlock}
        className={cn(ActiveStyle, !canUnlock && DisabledStyle)}
        onClick={() => {
          if (canUnlock && activeObject) {
            unLock(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!canUnlock && DisabledStyle)}>위치 잠금 해제하기</p>
        <p className={cn(!canUnlock && DisabledShortCutStyle)}>
          Ctrl + Shift + L
        </p>
      </button>
    </>
  );
};
