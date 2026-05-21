import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/atoms/button';
import AddDrawing from '@/shared/assets/icons/add-drawing.svg';
import AddEraser from '@/shared/assets/icons/add-eraser.svg';
import AddImage from '@/shared/assets/icons/add-image.svg';
import AddPencil from '@/shared/assets/icons/add-pencil.svg';
import AddText from '@/shared/assets/icons/add-text.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

function Toolbar() {
  const { canvas, createTextBox, setDrawingType, drawingType } =
    useFabricContext();
  const { activeTab, setActiveTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
    }))
  );

  if (!canvas) return null;

  const TOOLBAR_ITEMS = [
    {
      id: 'text',
      icon: <AddText width={14} height={14} />,
      onClick: () => {
        setActiveTab('text');
        createTextBox(canvas);
      },
      active: activeTab === 'text',
    },
    {
      id: 'image',
      icon: <AddImage width={14} height={14} />,
      onClick: () => {
        setActiveTab('image');
      },
      active: activeTab === 'image',
    },
    {
      id: 'graphic',
      icon: <AddDrawing width={14} height={14} />,
      onClick: () => {
        setActiveTab('graphic');
        setDrawingType('pen');
      },
      active: activeTab === 'graphic' && drawingType === 'pen',
    },
  ];

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -left-6 -translate-x-full flex flex-col gap-3 items-center"
      data-canvas="true"
    >
      {TOOLBAR_ITEMS.map(item => (
        <Button
          key={item.id}
          className="size-8"
          onClick={item.onClick}
          variant="bordered"
          active={item.active}
        >
          {item.icon}
        </Button>
      ))}
      {activeTab === 'graphic' && (
        <div className="absolute top-full mt-3 flex flex-col gap-3 items-center">
          <Button
            className="size-8"
            variant="bordered"
            active={drawingType === 'pencil'}
            onClick={() => {
              setDrawingType('pencil');
            }}
          >
            <AddPencil width={14} height={14} />
          </Button>
          <Button
            className="size-8"
            variant="bordered"
            active={drawingType === 'eraser'}
            onClick={() => {
              setDrawingType('eraser');
            }}
          >
            <AddEraser width={14} height={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
export default Toolbar;
