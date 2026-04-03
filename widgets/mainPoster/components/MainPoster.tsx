import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { GraphicPanel } from './graphic/GraphicPanel';
import { ImagePanel } from './image/ImagePanel';
import RichTextPanel from './richtext/RichTextPanel';

export const MainPoster = () => {
  const { activeTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
    }))
  );
  const { canvas, applyRichStyle } = useFabricContext();

  if (!canvas) return null;

  return (
    <div className="flex flex-col pb-3.5 px-5 items-center">
      {/* 텍스트 */}
      {activeTab === 'text' && (
        <RichTextPanel canvas={canvas} applyRichStyle={applyRichStyle} />
      )}

      {/* 이미지 */}
      {activeTab === 'image' && <ImagePanel />}

      {/* 도형 */}
      {activeTab === 'diagram' && <GraphicPanel />}
    </div>
  );
};
