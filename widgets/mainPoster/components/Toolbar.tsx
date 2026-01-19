import * as fabric from 'fabric';

interface Props {
  canvas: fabric.Canvas | null;
  dragToCreateTextBox: (canvas: fabric.Canvas) => () => void;
}

function Toolbar({ canvas, dragToCreateTextBox }: Props) {
  if (!canvas) return null;
  return (
    <div className="flex gap-2 p-4 bg-gray-100 border-b border-gray-300">
      <button
        onClick={() => dragToCreateTextBox(canvas)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        텍스트 추가
      </button>
    </div>
  );
}
export default Toolbar;
