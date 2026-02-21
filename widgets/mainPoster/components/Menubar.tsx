import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/widgets/editor/store/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { GraphicPanel } from './graphic/GraphicPanel';
import History from './History';
import { ImagePanel } from './image/ImagePanel';
import RichTextPanel from './richtext/RichTextPanel';

function Menubar() {
  const { activeTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
    }))
  );
  const { activeInfo, canvas, applyRichStyle } = useFabricContext();

  // 현재 선택된 객체가 텍스트인지 이미지인지 확인
  const isSelectedText =
    activeInfo.type === 'textbox' || activeInfo.type === 'itext';

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
      <History canvas={canvas} />
      {/* 텍스트 */}
      {isSelectedText && activeTab === null && (
        <RichTextPanel canvas={canvas} applyRichStyle={applyRichStyle} />
      )}

      {/* 이미지 */}
      {activeTab === 'image' && <ImagePanel />}

      {/* 도형 */}
      {activeTab === 'diagram' && <GraphicPanel />}
    </div>
  );
}
export default Menubar;
