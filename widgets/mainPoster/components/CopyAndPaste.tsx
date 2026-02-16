import { Canvas, FabricObject } from 'fabric';

import { useFabric } from '../hooks/useFabric';

interface Props {
  onClick: () => void;
  canvas: Canvas;
  activeObject: FabricObject | null;
  clipboard: FabricObject | null;
  setClipboard: (clipboard: FabricObject | null) => void;
}

function CopyAndPaste({
  onClick,
  canvas,
  activeObject,
  clipboard,
  setClipboard,
}: Props) {
  const { copy, paste } = useFabric();

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
