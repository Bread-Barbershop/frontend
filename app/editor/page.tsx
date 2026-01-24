import LeftPanel from '@/features/editor/leftPanel/LeftPanel';
import Preview from '@/features/editor/preveiw/Preview';
import RightPanel from '@/features/editor/rightPanel/RightPanel';

const EditorPage = () => {
  return (
    <div className="w-screen h-screen bg-[#E7E9EB] flex flex-col gap-13 justify-center">
      <div className="flex justify-between items-center">
        <LeftPanel />
        <Preview />
        <RightPanel />
      </div>
    </div>
  );
};
export default EditorPage;
