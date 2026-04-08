import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { BackgroundPanel } from './background/BackgroundPanel';
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
  const { canvas } = useFabricContext();

  const handleExportJSON = () => {
    if (!canvas) return;
    const json = canvas.toJSON();

    // eslint-disable-next-line no-console
    console.log('Fabric Canvas JSON:', JSON.stringify(json, null, 2));
  };

  const handleImportJSON = async () => {
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
    <div className="flex flex-col pb-3.5 px-5 items-center" data-canvas="true">
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
      <History />
      {/* 텍스트 */}
      {activeTab === 'text' && <RichTextPanel />}

      {/* 이미지 */}
      {activeTab === 'image' && <ImagePanel />}

      {/* 도형 */}
      {activeTab === 'diagram' && <GraphicPanel />}

      {/* 배경 */}
      {activeTab === 'background' && <BackgroundPanel />}
    </div>
  );
}
export default Menubar;
