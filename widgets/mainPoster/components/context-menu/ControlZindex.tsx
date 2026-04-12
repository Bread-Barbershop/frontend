import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { FabricObjectWithLock } from '../../types/fabric';

interface Props {
  onClick: () => void;
}

function ControlZindex({ onClick }: Props) {
  const { canvas, moveUp, moveDown, moveTop, moveBottom } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as FabricObjectWithLock;

  return (
    <>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200 flex justify-between"
        onClick={() => {
          moveTop(activeObject);
          onClick();
        }}
      >
        <p>맨 위로 보내기</p>
        <p>Ctrl + Shift + [</p>
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200 flex justify-between"
        onClick={() => {
          moveBottom(activeObject);
          onClick();
        }}
      >
        <p>맨 아래로 보내기</p>
        <p>Ctrl + Shift + ]</p>
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200 flex justify-between"
        onClick={() => {
          moveUp(activeObject);
          onClick();
        }}
      >
        <p>위로 보내기</p>
        <p>Ctrl + [</p>
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200 flex justify-between"
        onClick={() => {
          moveDown(activeObject);
          onClick();
        }}
      >
        <p>아래로 보내기</p>
        <p>Ctrl + ]</p>
      </button>
    </>
  );
}
export default ControlZindex;
