import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { BackgroundPanel } from './background/BackgroundPanel';
import { GraphicPanel } from './graphic/GraphicPanel';
import { ImagePanel } from './image/ImagePanel';
import { RichTextPanel } from './richtext/RichTextPanel';

export const MainPoster = () => {
  const { activeTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
    }))
  );
  const { canvas } = useFabricContext();

  if (!canvas) return null;

  return (
    <div className="flex flex-col pb-3.5 px-5 items-center w-full" data-canvas="true">
      {/* 텍스트 */}
      <div className={activeTab === 'text' ? 'contents' : 'hidden'}>
        <RichTextPanel />
      </div>

      {/* 이미지 */}
      <div className={activeTab === 'image' ? 'contents' : 'hidden'}>
        <ImagePanel />
      </div>

      {/* 도형 */}
      <div className={activeTab === 'diagram' ? 'contents' : 'hidden'}>
        <GraphicPanel />
      </div>

      {/* 배경 */}
      <div className={activeTab === 'background' ? 'contents' : 'hidden'}>
        <BackgroundPanel />
      </div>
    </div>
  );
};
