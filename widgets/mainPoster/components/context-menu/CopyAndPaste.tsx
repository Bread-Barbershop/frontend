import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { ActiveStyle, DisabledShortCutStyle, DisabledStyle } from './style';

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
        className={cn(ActiveStyle, !hasActiveObject && DisabledStyle)}
        onClick={async () => {
          if (hasActiveObject) {
            await copy();
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && DisabledStyle)}>복사</p>
        <p className={cn(!hasActiveObject && DisabledShortCutStyle)}>
          Ctrl + C
        </p>
      </button>
      <button
        type="button"
        disabled={!hasClipboard}
        className={cn(ActiveStyle, !hasClipboard && DisabledStyle)}
        onClick={async () => {
          if (hasClipboard) {
            await paste();
            onClick();
          }
        }}
      >
        <p className={cn(!hasClipboard && DisabledStyle)}>붙여넣기</p>
        <p className={cn(!hasClipboard && DisabledShortCutStyle)}>Ctrl + V</p>
      </button>
    </>
  );
}

export default CopyAndPaste;
