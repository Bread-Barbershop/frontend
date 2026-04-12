import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

interface Props {
  onClick: () => void;
}

function CopyAndPaste({ onClick }: Props) {
  const { copy, paste, activeInfo, clipboard } = useFabricContext();
  const hasActiveObject = activeInfo.type !== null;
  const hasClipboard = clipboard !== null;

  return (
    <>
      <button
        type="button"
        disabled={!hasActiveObject}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !hasActiveObject && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={async () => {
          if (hasActiveObject) {
            await copy();
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && 'text-gray-400')}>복사</p>
        <p className={cn(!hasActiveObject && 'text-gray-400')}>Ctrl + C</p>
      </button>
      <button
        type="button"
        disabled={!hasClipboard}
        className={cn(
          'hover:bg-gray-100 active:bg-gray-200 flex justify-between px-1 rounded transition-colors',
          !hasClipboard && 'opacity-50 cursor-not-allowed grayscale'
        )}
        onClick={async () => {
          if (hasClipboard) {
            await paste();
            onClick();
          }
        }}
      >
        <p className={cn(!hasClipboard && 'text-gray-400')}>붙여넣기</p>
        <p className={cn(!hasClipboard && 'text-gray-400')}>Ctrl + V</p>
      </button>
    </>
  );
}

export default CopyAndPaste;
