import { Canvas, FabricObject } from 'fabric';

interface Props {
  onClick: () => void;
  canvas: Canvas;
  activeObject: FabricObject | null;
  clipboard: FabricObject | null;
  setClipboard: (clipboard: FabricObject | null) => void;
  copy: (args: {
    activeObject: FabricObject | null;
    setClipboard: (clipboard: FabricObject | null) => void;
  }) => void;
  paste: (args: { canvas: Canvas; clipboard: FabricObject | null }) => void;
}

function CopyAndPaste({
  onClick,
  canvas,
  activeObject,
  clipboard,
  setClipboard,
  copy,
  paste,
}: Props) {
  return (
    <>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          if (!activeObject) return;
          copy({ activeObject, setClipboard });
          onClick();
        }}
      >
        복사
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          if (!clipboard) return;
          paste({ canvas, clipboard });
          onClick();
        }}
      >
        붙여넣기
      </button>
    </>
  );
}

export default CopyAndPaste;
