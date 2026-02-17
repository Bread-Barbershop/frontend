import { Canvas, FabricObject } from 'fabric';

interface Props {
  onClick: () => void;
  canvas: Canvas;
  activeObject: FabricObject | null;
}

function ControlZindex({ onClick, canvas, activeObject }: Props) {
  const moveUp = () => {
    if (!activeObject) return;
    canvas.bringObjectForward(activeObject);
    canvas.requestRenderAll();
  };

  const moveDown = () => {
    if (!activeObject) return;
    canvas.sendObjectBackwards(activeObject);
    canvas.requestRenderAll();
  };

  const moveTop = () => {
    if (!activeObject) return;
    canvas.bringObjectToFront(activeObject);
    canvas.requestRenderAll();
  };

  const moveBottom = () => {
    if (!activeObject) return;
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
