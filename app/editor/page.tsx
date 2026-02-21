'use client';
import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import Preview from '@/widgets/editor/preveiw/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';
import { useEditorStore } from '@/widgets/editor/store/useEditorStore';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

const EditorPage = () => {
  const { canvas } = useEditorStore();
  return (
    <div className="w-screen h-screen bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-hidden">
      <div className="flex justify-between items-center">
        <FabricProvider canvas={canvas!}>
          <LeftPanel />
          <Preview />
          <RightPanel />
        </FabricProvider>
      </div>
    </div>
  );
};
export default EditorPage;
