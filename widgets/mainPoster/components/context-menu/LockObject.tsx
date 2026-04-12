import { cn } from '@/shared/utils/cn';

import { useFabricContext } from '../../context/FabricContext';
import { FabricObjectWithLock } from '../../types/fabric';

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
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !canLock && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={() => {
          if (canLock && activeObject) {
            lock(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!canLock && 'text-gray-400')}>잠그기</p>
        <p className={cn(!canLock && 'text-gray-400')}>Ctrl + L</p>
      </button>
      <button
        type="button"
        disabled={!canUnlock}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !canUnlock && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={() => {
          if (canUnlock && activeObject) {
            unLock(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!canUnlock && 'text-gray-400')}>잠금 해제하기</p>
        <p className={cn(!canUnlock && 'text-gray-400')}>
          Ctrl + Shift + L
        </p>
      </button>
    </>
  );
};
