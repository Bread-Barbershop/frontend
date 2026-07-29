// import { useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
// import { Label } from '@/components/atoms/label/Label';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { BackgroundColorPanel } from './background/BackgroundColorPanel';
import { GraphicPanel } from './graphic/GraphicPanel';
import { ImagePanel } from './image/ImagePanel';
import { RichTextPanel } from './richtext/RichTextPanel';
import { ShapePanel } from './shape/ShapePanel';
import { SlotPanel } from './slot/SlotPanel';

export const MainPoster = () => {
  const { activeTab, setActiveTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
    }))
  );
  // const searchParams = useSearchParams();
  // const isAdmin = searchParams.get('type') === 'admin';
  // const { canvas, exportCanvasPreview, exportIntersectedJSON, createTextBox } =
  //   useFabricContext();
  const { canvas, createTextBox } = useFabricContext();

  if (!canvas) return null;

  const PanelItems = [
    {
      id: 'background',
      value: '배경색',
      onClick: () => {
        setActiveTab('background');
      },
    },
    {
      id: 'text',
      value: '텍스트',
      onClick: () => {
        setActiveTab('text');
      },
    },
    {
      id: 'image',
      value: '이미지',
      onClick: () => {
        setActiveTab('image');
      },
    },
    {
      id: 'graphic',
      value: '그리기',
      onClick: () => {
        setActiveTab('graphic');
      },
    },
  ];

  // const handleDownloadImage = () => {
  //   const preview = exportCanvasPreview();
  //   if (!preview) return;
  //   const link = document.createElement('a');
  //   link.href = preview.dataUrl;
  //   link.download = preview.name;
  //   link.click();
  // };

  // const handleDownloadJSON = () => {
  //   const json = exportIntersectedJSON();
  //   if (!json) return;
  //   const blob = new Blob([JSON.stringify(json, null, 2)], {
  //     type: 'application/json',
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = 'template.json';
  //   link.click();
  //   URL.revokeObjectURL(url);
  // };

  if (!canvas) return null;

  return (
    <div
      className="flex w-full flex-col items-center pb-3.5 max-h-[812px] overflow-y-scroll overflow-x-hidden scrollbar-hide"
      data-canvas="true"
    >
      {/* {isAdmin && (
        <div className="flex gap-2 w-full py-3">
          <Label className="text-sm text-text-secondary">개발용</Label>
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
      )} */}

      <div className="w-full px-5">
        <NavigationBar
          action={
            activeTab === 'text' ? (
              <UtilityButton
                size="md"
                variant="primary"
                className="text-sm"
                onClick={() => createTextBox(canvas)}
              >
                텍스트 추가
              </UtilityButton>
            ) : null
          }
          direction="right"
        >
          포스터
        </NavigationBar>

        <div className="w-full h-11 flex gap-2 items-center justify-center bg-white rounded-lg user-select-none">
          {PanelItems.map(item => {
            const isActive =
              activeTab === item.id ||
              (activeTab === 'template' && item.id === 'image');

            return (
              <button
                key={item.id}
                type="button"
                className={`w-[54px] h-8 font-medium text-sm ${isActive ? 'border-b text-text-primary' : 'text-text-secondary'}`}
                onClick={item.onClick}
              >
                <p>{item.value}</p>
              </button>
            );
          })}
        </div>
      </div>
      {activeTab === 'text' && <RichTextPanel />}

      {(activeTab === 'image' || activeTab === 'template') && <ImagePanel />}

      {activeTab === 'slot' && <SlotPanel />}

      {activeTab === 'graphic' && <GraphicPanel />}

      {activeTab === 'shape' && <ShapePanel />}

      {(activeTab === 'background' || !activeTab) && <BackgroundColorPanel />}
    </div>
  );
};
