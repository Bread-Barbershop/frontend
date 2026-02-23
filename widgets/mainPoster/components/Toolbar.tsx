import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/atoms/button';
import { useEditorStore } from '@/widgets/editor/store/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

function Toolbar() {
  const { canvas, dragToCreateTextBox } = useFabricContext();
  const { activeTab, setActiveTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
    }))
  );

  if (!canvas) return null;

  return (
    <div className="absolute top-1/2 -translate-y-1/2 -left-3 -translate-x-full flex flex-col gap-3">
      <Button onClick={() => dragToCreateTextBox(canvas)}>텍스트</Button>
      <Button
        onClick={() => {
          setActiveTab('image');
        }}
        variant="bordered"
        active={activeTab === 'image'}
      >
        사진
      </Button>
      <Button
        onClick={() => {
          setActiveTab('diagram');
        }}
        variant="bordered"
        active={activeTab === 'diagram'}
      >
        기타
      </Button>
    </div>
  );
}
export default Toolbar;
