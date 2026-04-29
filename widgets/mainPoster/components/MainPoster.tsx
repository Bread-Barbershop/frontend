import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
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
  const { canvas, exportCanvasPreview, exportIntersectedJSON } =
    useFabricContext();

  const handleDownloadImage = () => {
    const preview = exportCanvasPreview();
    if (!preview) return;
    const link = document.createElement('a');
    link.href = preview.dataUrl;
    link.download = preview.name;
    link.click();
  };

  const handleDownloadJSON = () => {
    const json = exportIntersectedJSON();
    if (!json) return;
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!canvas) return null;

  return (
    <div
      className="flex flex-col pb-3.5 px-5 items-center w-full max-h-203 overflow-y-auto overflow-x-hidden edit-custom-scrollbar"
      data-canvas="true"
    >
      <NavigationBar>포스터 프리뷰(개발용)</NavigationBar>
      <div className="flex gap-2 w-full mb-4">
        <UtilityButton
          size="sm"
          className="flex-1"
          onClick={handleDownloadImage}
        >
          이미지 다운로드
        </UtilityButton>
        <UtilityButton
          size="sm"
          className="flex-1"
          onClick={handleDownloadJSON}
        >
          데이터 다운로드
        </UtilityButton>
      </div>

      {/* 텍스트 */}
      {activeTab === 'text' && <RichTextPanel />}

      {/* 이미지 */}
      {activeTab === 'image' && <ImagePanel />}

      {/* 도형 */}
      {activeTab === 'diagram' && <GraphicPanel />}

      {/* 배경 */}
      {(activeTab === 'background' || !activeTab) && <BackgroundPanel />}
    </div>
  );
};
