import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

interface Props {
  onClick: () => void;
}

function ControlZindex({ onClick }: Props) {
  const { canvas } = useFabricContext();
  const activeObject = canvas?.getActiveObject();

  const moveUp = () => {
    if (!activeObject || !canvas) return;
    canvas.bringObjectForward(activeObject);
    canvas.requestRenderAll();
  };

  const moveDown = () => {
    if (!activeObject || !canvas) return;
    canvas.sendObjectBackwards(activeObject);
    canvas.requestRenderAll();
  };

  const moveTop = () => {
    if (!activeObject || !canvas) return;
    canvas.bringObjectToFront(activeObject);
    canvas.requestRenderAll();
  };

  const moveBottom = () => {
    if (!activeObject || !canvas) return;
    canvas.sendObjectToBack(activeObject);
    canvas.requestRenderAll();
  };

  return (
    <>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          moveTop();
          onClick();
        }}
      >
        맨 위로 보내기
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          moveBottom();
          onClick();
        }}
      >
        맨 아래로 보내기
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          moveUp();
          onClick();
        }}
      >
        위로 보내기
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          moveDown();
          onClick();
        }}
      >
        아래로 보내기
      </button>
    </>
  );
}
export default ControlZindex;
