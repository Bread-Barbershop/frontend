import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/atoms/button';
import AddDrawing from '@/shared/assets/icons/add-drawing.svg';
import AddImage from '@/shared/assets/icons/add-image.svg';
import AddText from '@/shared/assets/icons/add-text.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

function Toolbar() {
  const { canvas, createTextBox } = useFabricContext();
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
      id: 'diagram',
      icon: <AddDrawing width={14} height={14} />,
      onClick: () => {
        setActiveTab('diagram');
      },
      active: activeTab === 'diagram',
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
    </div>
  );
}
export default Toolbar;
