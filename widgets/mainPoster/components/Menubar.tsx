import { Textbox } from 'fabric';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/widgets/editor/store/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { GraphicPanel } from './graphic/GraphicPanel';
import { ImagePanel } from './image/ImagePanel';
import RichTextPanel from './richtext/RichTextPanel';

function Menubar() {
  const { canvas, activeObject, activeTab } = useEditorStore(
    useShallow(state => ({
      canvas: state.canvas,
      activeObject: state.activeObject,
      activeTab: state.activeTab,
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
    activeInfo,
  } = useFabricContext();

  // 현재 선택된 객체가 텍스트인지 이미지인지 확인
  const isSelectedText = activeObject instanceof Textbox;

  // const handleExportJSON = () => {
  //   if (!canvas) return;
  // };

  // const handleImportJSON = async () => {
  //   if (!canvas) return;
  //   try {
  //     await canvas.loadFromJSON(jsonString);
  //     canvas.requestRenderAll();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  if (!canvas) return null;

  return (
    <div className="flex flex-col pb-3.5 px-5 items-center">
      {/* <div className="flex gap-2 pb-2.5 justify-center">
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
      </div> */}
      {/* {renderPanel()} */}

      {/* 텍스트 */}
      {isSelectedText && activeTab === null && (
        <RichTextPanel
          canvas={canvas}
          applyRichStyle={applyRichStyle}
          activeObject={activeObject}
          getRichStyles={getRichStyles}
        />
      )}

      {/* 이미지 */}
      {activeTab === 'image' && (
        <ImagePanel
          canvas={canvas}
          addImage={addImage}
          applyImageFilter={applyImageFilter}
          startCrop={startCrop}
          isCropping={isCropping}
          activeInfo={activeInfo}
        />
      )}

      {/* 도형 */}
      {activeTab === 'diagram' && <GraphicPanel />}
    </div>
  );
}
export default Menubar;
