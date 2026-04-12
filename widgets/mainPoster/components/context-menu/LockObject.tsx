import { useFabricContext } from '../../context/FabricContext';
import { FabricObjectWithLock } from '../../types/fabric';

interface Props {
  onClick: () => void;
}

export const LockObject = ({ onClick }: Props) => {
  const { canvas, lock, unLock } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as FabricObjectWithLock;

  return (
    <>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200 flex justify-between"
        onClick={() => {
          lock(activeObject);
          onClick();
        }}
      >
        <p>잠그기</p>
        <p>Ctrl + L</p>
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200 flex justify-between"
        onClick={() => {
          unLock(activeObject);
          onClick();
        }}
      >
        <p>잠금 해제하기</p>
        <p>Ctrl + Shift + L</p>
      </button>
    </>
  );
};
