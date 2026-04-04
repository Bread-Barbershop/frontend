import { useFabricContext } from '../../context/FabricContext';
import { FabricObjectWithLock } from '../../types/fabric';

interface Props {
  onClick: () => void;
}

export const LockObject = ({ onClick }: Props) => {
  const { canvas } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as FabricObjectWithLock;

  const lock = () => {
    if (!activeObject) return;
    activeObject.set({
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      editable: false,
      isLocked: true,
    });
    canvas?.requestRenderAll();
  };

  const unLock = () => {
    if (!activeObject) return;
    activeObject.set({
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      hasControls: true,
      editable: true,
      isLocked: false,
    });
    canvas?.requestRenderAll();
  };

  return (
    <>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          lock();
          onClick();
        }}
      >
        잠그기
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          unLock();
          onClick();
        }}
      >
        잠금 해제하기
      </button>
    </>
  );
};
