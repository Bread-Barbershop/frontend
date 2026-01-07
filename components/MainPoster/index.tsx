'use client';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { useCanvas } from './hooks/useCanvas';

const MainPoster = () => {
  const {
    shapes,
    selectedId,
    isEditing,
    cursor,
    addImage,
    updateShape,
    selectShape,
    handleDeleteShape,
    handleTextChange,
    handleTransform,
    handleTextDblClick,
    setIsEditing,
    toggleTextBoxMode,
    newTextBox,
    isAddText,
    drawTextBoxStart,
    drawTextBoxMove,
    drawTextBoxEnd,
  } = useCanvas();

  return (
    <div className="flex flex-col h-screen">
      <Toolbar onAddText={toggleTextBoxMode} onAddImage={addImage} />
      <Canvas
        newTextBox={newTextBox}
        shapes={shapes}
        cursor={cursor}
        selectedId={selectedId}
        isEditing={isEditing}
        isAddText={isAddText}
        onSelect={selectShape}
        onUpdateShape={updateShape}
        handleDeleteShape={handleDeleteShape}
        handleTextChange={handleTextChange}
        handleTransform={handleTransform}
        handleTextDblClick={handleTextDblClick}
        setIsEditing={setIsEditing}
        drawTextBoxStart={drawTextBoxStart}
        drawTextBoxMove={drawTextBoxMove}
        drawTextBoxEnd={drawTextBoxEnd}
      />
    </div>
  );
};

export default MainPoster;
