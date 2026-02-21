import { Canvas } from 'fabric';
import { useEffect } from 'react';

import { useFabricContext } from '../context/FabricContext';

function History({ canvas }: { canvas: Canvas }) {
  const { saveHistory, undo, redo } = useFabricContext();

  useEffect(() => {
    if (!canvas) return;

    const handleSave = () => saveHistory();

    canvas.on('object:modified', handleSave);
    canvas.on('object:added', handleSave);
    canvas.on('object:removed', handleSave);

    return () => {
      canvas.off('object:modified', handleSave);
      canvas.off('object:added', handleSave);
      canvas.off('object:removed', handleSave);
    };
  }, [canvas]);

  return (
    <div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={undo}
      >
        undo
      </button>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={redo}
      >
        redo
      </button>
    </div>
  );
}

export default History;
