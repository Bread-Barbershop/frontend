import { Textbox, FabricImage } from 'fabric';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/widgets/editor/store/useEditorStore';

import { useFabric } from '../hooks/useFabric';

import ImageFilterPanel from './image/ImageFilterPanel';
import RichTextPanel from './richtext/RichTextPanel';
import jsonString from './test.json';

function Menubar() {
  const { canvas, activeObject } = useEditorStore(
    useShallow(state => ({
      canvas: state.canvas,
      activeObject: state.activeObject,
    }))
  );
  const {
    applyRichStyle,
    applyImageFilter,
    getRichStyles,
    addImage,
    startCrop,
    isCropping,
    applyCrop,
    cancelCrop,
  } = useFabric();

  // 현재 선택된 객체가 텍스트인지 이미지인지 확인
  const isSelectedText = activeObject instanceof Textbox;
  const isSelectedImage = activeObject instanceof FabricImage || isCropping;

  const handleExportJSON = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    console.log('Fabric Canvas JSON:', JSON.stringify(json, null, 2));
  };

  const handleImportJSON = async () => {
    console.log({ jsonString });
    if (!canvas) return;
    try {
      await canvas.loadFromJSON(jsonString);
      canvas.requestRenderAll();
    } catch (error) {
      console.error(error);
    }
  };

  if (!canvas) return null;

  return (
    <div className="flex flex-col pb-3.5 px-5 items-center">
      <div className="flex gap-2 pb-2.5 justify-center">
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={handleExportJSON}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={handleImportJSON}
        >
          Import JSON
        </button>
      </div>
      {isSelectedText && (
        <RichTextPanel
          canvas={canvas}
          applyRichStyle={applyRichStyle}
          activeObject={activeObject}
          getRichStyles={getRichStyles}
        />
      )}
      {isSelectedImage && (
        <ImageFilterPanel
          canvas={canvas}
          addImage={addImage}
          applyImageFilter={applyImageFilter}
          startCrop={startCrop}
          isCropping={isCropping}
          applyCrop={applyCrop}
          cancelCrop={cancelCrop}
        />
      )}
    </div>
  );
}
export default Menubar;
