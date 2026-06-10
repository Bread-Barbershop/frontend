import { cn } from '@/shared/utils/cn';

import { useFabricContext } from '../../context/FabricContext';

import { ActiveStyle, DisabledStyle, DisabledShortCutStyle } from './style';

interface Props {
  onClick: () => void;
}

export const DeleteObject = ({ onClick }: Props) => {
  const { canvas, handleDeleteShape, activeInfo } = useFabricContext();
  const hasActiveObject = activeInfo.type !== null;

  return (
    <button
      type="button"
      disabled={!hasActiveObject}
      className={cn(ActiveStyle, !hasActiveObject && DisabledStyle)}
      onClick={() => {
        if (canvas && hasActiveObject) {
          handleDeleteShape(canvas, undefined, true);
        }
        onClick();
      }}
    >
      <p className={cn(!hasActiveObject && DisabledStyle)}>삭제하기</p>
      <p className={cn(!hasActiveObject && DisabledShortCutStyle)}>Delete</p>
    </button>
  );
};
