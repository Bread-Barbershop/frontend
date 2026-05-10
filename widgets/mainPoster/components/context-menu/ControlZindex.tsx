import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { FabricObjectWithLock } from '../../types/fabric';

import { ActiveStyle, DisabledStyle, DisabledShortCutStyle } from './style';

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
        className={cn(ActiveStyle, !hasActiveObject && DisabledStyle)}
        onClick={() => {
          if (hasActiveObject && activeObject) {
            moveTop(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && DisabledStyle)}>맨 위로 보내기</p>
        <p className={cn(!hasActiveObject && DisabledShortCutStyle)}>
          Ctrl + Shift + [
        </p>
      </button>
      <button
        type="button"
        disabled={!hasActiveObject}
        className={cn(ActiveStyle, !hasActiveObject && DisabledStyle)}
        onClick={() => {
          if (hasActiveObject && activeObject) {
            moveBottom(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && DisabledStyle)}>
          맨 아래로 보내기
        </p>
        <p className={cn(!hasActiveObject && DisabledShortCutStyle)}>
          Ctrl + Shift + ]
        </p>
      </button>
      <button
        type="button"
        disabled={!hasActiveObject}
        className={cn(ActiveStyle, !hasActiveObject && DisabledStyle)}
        onClick={() => {
          if (hasActiveObject && activeObject) {
            moveUp(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && DisabledStyle)}>위로 보내기</p>
        <p className={cn(!hasActiveObject && DisabledShortCutStyle)}>
          Ctrl + [
        </p>
      </button>
      <button
        type="button"
        disabled={!hasActiveObject}
        className={cn(ActiveStyle, !hasActiveObject && DisabledStyle)}
        onClick={() => {
          if (hasActiveObject && activeObject) {
            moveDown(activeObject);
            onClick();
          }
        }}
      >
        <p className={cn(!hasActiveObject && DisabledStyle)}>아래로 보내기</p>
        <p className={cn(!hasActiveObject && DisabledShortCutStyle)}>
          Ctrl + ]
        </p>
      </button>
    </>
  );
}
export default ControlZindex;
