import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import Preview from '@/widgets/editor/preveiw/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';

const EditorPage = () => {
  return (
    <div className="w-screen h-screen bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-hidden">
      <div className="flex justify-between items-center">
        <LeftPanel />
        <Preview />
        <RightPanel />
      </div>
    </div>
  );
};
export default EditorPage;
