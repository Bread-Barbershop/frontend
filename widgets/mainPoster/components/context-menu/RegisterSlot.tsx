import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { FabricObjectWithLock } from '../../types/fabric';

import { ActiveStyle, DisabledShortCutStyle, DisabledStyle } from './style';

interface Props {
  onClick: () => void;
}

export const RegisterSlot = ({ onClick }: Props) => {
  const { canvas, convertActiveRectToSlot, unregisterActiveSlot } =
    useFabricContext();
  const activeObject = canvas?.getActiveObject() as FabricObjectWithLock;
  const canConvertToSlot =
    activeObject?.isType('rect') && !activeObject.get('slot');
  const canUnregisterSlot =
    activeObject?.isType('rect') && Boolean(activeObject.get('slot'));

  return (
    <>
      <button
        type="button"
        disabled={!canConvertToSlot}
        className={cn(ActiveStyle, !canConvertToSlot && DisabledStyle)}
        onClick={() => {
          if (canvas && canConvertToSlot) {
            convertActiveRectToSlot();
          }
          onClick();
        }}
      >
        <p className={cn(!canConvertToSlot && DisabledStyle)}>
          슬롯으로 변환하기
        </p>
        <p className={cn(!canConvertToSlot && DisabledShortCutStyle)}>
          Ctrl + P
        </p>
      </button>
      <button
        type="button"
        disabled={!canUnregisterSlot}
        className={cn(ActiveStyle, !canUnregisterSlot && DisabledStyle)}
        onClick={() => {
          if (canvas && canUnregisterSlot) {
            unregisterActiveSlot();
          }
          onClick();
        }}
      >
        <p className={cn(!canUnregisterSlot && DisabledStyle)}>슬롯 해제하기</p>
        <p className={cn(!canUnregisterSlot && DisabledShortCutStyle)}>
          Ctrl + Shift + P
        </p>
      </button>
    </>
  );
};
