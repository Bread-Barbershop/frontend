import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { ActiveStyle, DisabledShortCutStyle, DisabledStyle } from './style';

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
        className={cn(ActiveStyle, !canUndo && DisabledStyle)}
        onClick={() => {
          if (canUndo) {
            undo();
            onClick();
          }
        }}
      >
        <p className={cn(!canUndo && DisabledStyle)}>되돌리기</p>
        <p className={cn(!canUndo && DisabledShortCutStyle)}>Ctrl + Z</p>
      </button>
      <button
        type="button"
        disabled={!canRedo}
        className={cn(ActiveStyle, !canRedo && DisabledStyle)}
        onClick={() => {
          if (canRedo) {
            redo();
            onClick();
          }
        }}
      >
        <p className={cn(!canRedo && DisabledStyle)}>다시하기</p>
        <p className={cn(!canRedo && DisabledShortCutStyle)}>
          Ctrl + Shift + Z
        </p>
      </button>
    </>
  );
};
