import * as fabric from 'fabric';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/widgets/editor/store/useEditorStore';
import { Image } from '@/widgets/mainPoster/types/fabric';

import { useFabric } from '../hooks/useFabric';

import ImageFilterPanel from './ImageFilterPanel';
import RichTextPanel from './RichTextPanel';
import jsonString from './test.json';

function Menubar() {
  const { canvas, activeObject } = useEditorStore(
    useShallow(state => ({
      canvas: state.canvas,
      activeObject: state.activeObject,
    }))
  );
  const { shapes, applyRichStyle, applyImageFilter, getRichStyles } =
    useFabric();
  const isSelectedTextbox = activeObject instanceof fabric.Textbox;
  const isSelectedImage = activeObject instanceof fabric.FabricImage;
  const currentImageShape = isSelectedImage
    ? (shapes.find(s => s.id === activeObject.id) as Image)
    : null;
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
  return (
    <div className="flex flex-col pt-2.5 items-center">
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
      {isSelectedTextbox && (
        <RichTextPanel
          canvas={canvas}
          applyRichStyle={applyRichStyle}
          activeObject={activeObject as unknown as fabric.Textbox}
          getRichStyles={getRichStyles}
        />
      )}
      {isSelectedImage && (
        <ImageFilterPanel
          canvas={canvas}
          applyImageFilter={applyImageFilter}
          currentFilters={currentImageShape?.filters}
        />
      )}
    </div>
  );
}
export default Menubar;
