import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

interface Props {
  onClick: () => void;
}

export const UndoRedo = ({ onClick }: Props) => {
  const { undo, redo, canUndo, canRedo } = useFabricContext();

  return (
    <>
      <button
        type="button"
        disabled={!canUndo}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !canUndo && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={() => {
          if (canUndo) {
            undo();
            onClick();
          }
        }}
      >
        <p className={cn(!canUndo && 'text-gray-400')}>되돌리기</p>
        <p className={cn(!canUndo && 'text-gray-400')}>Ctrl + Z</p>
      </button>
      <button
        type="button"
        disabled={!canRedo}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !canRedo && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={() => {
          if (canRedo) {
            redo();
            onClick();
          }
        }}
      >
        <p className={cn(!canRedo && 'text-gray-400')}>다시하기</p>
        <p className={cn(!canRedo && 'text-gray-400')}>Ctrl + Shift + Z</p>
      </button>
    </>
  );
};
