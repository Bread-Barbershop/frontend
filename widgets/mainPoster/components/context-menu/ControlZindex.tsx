import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { FabricObjectWithLock } from '../../types/fabric';

interface Props {
  onClick: () => void;
}

function ControlZindex({ onClick }: Props) {
  const { canvas, moveUp, moveDown, moveTop, moveBottom, activeInfo } =
    useFabricContext();
  const hasActiveObject = activeInfo.type !== null;
  const activeObject = canvas?.getActiveObject() as FabricObjectWithLock;

  return (
    <>
      <button
        type="button"
        disabled={!hasActiveObject}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !hasActiveObject && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={() => {
          if (hasActiveObject && activeObject) {
            moveTop(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && 'text-gray-400')}>
          맨 위로 보내기
        </p>
        <p className={cn(!hasActiveObject && 'text-gray-400')}>
          Ctrl + Shift + [
        </p>
      </button>
      <button
        type="button"
        disabled={!hasActiveObject}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !hasActiveObject && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={() => {
          if (hasActiveObject && activeObject) {
            moveBottom(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && 'text-gray-400')}>
          맨 아래로 보내기
        </p>
        <p className={cn(!hasActiveObject && 'text-gray-400')}>
          Ctrl + Shift + ]
        </p>
      </button>
      <button
        type="button"
        disabled={!hasActiveObject}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !hasActiveObject && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={() => {
          if (hasActiveObject && activeObject) {
            moveUp(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && 'text-gray-400')}>위로 보내기</p>
        <p className={cn(!hasActiveObject && 'text-gray-400')}>Ctrl + [</p>
      </button>
      <button
        type="button"
        disabled={!hasActiveObject}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !hasActiveObject && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={() => {
          if (hasActiveObject && activeObject) {
            moveDown(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && 'text-gray-400')}>아래로 보내기</p>
        <p className={cn(!hasActiveObject && 'text-gray-400')}>Ctrl + ]</p>
      </button>
    </>
  );
}
export default ControlZindex;
