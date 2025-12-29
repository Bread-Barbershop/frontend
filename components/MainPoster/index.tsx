'use client';

import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { useCanvas } from './hooks/useCanvas';

const MainPoster = () => {
  const { shapes, selectedId, addText, addImage, updateShape, selectShape } =
    useCanvas();

  return (
    <div className="flex flex-col h-screen">
      <Toolbar onAddText={addText} onAddImage={addImage} />
      <Canvas
        shapes={shapes}
        selectedId={selectedId}
        onSelect={selectShape}
        onUpdateShape={updateShape}
      />
    </div>
  );
};

export default MainPoster;
