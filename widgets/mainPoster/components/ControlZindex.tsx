import { Canvas, FabricObject } from 'fabric';

interface Props {
  onClick: () => void;
  canvas: Canvas;
  activeObject: FabricObject | null;
}

function ControlZindex({ onClick, canvas, activeObject }: Props) {
  const moveUp = () => {
    canvas.bringObjectForward(activeObject as FabricObject);
    canvas.requestRenderAll();
  };

  const moveDown = () => {
    canvas.sendObjectBackwards(activeObject as FabricObject);
    canvas.requestRenderAll();
  };

  const moveTop = () => {
    canvas.bringObjectToFront(activeObject as FabricObject);
    canvas.requestRenderAll();
  };

  const moveBottom = () => {
    canvas.sendObjectToBack(activeObject as FabricObject);
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
