import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import Preview from '@/widgets/editor/preview/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';

function MainContentsArea() {
  return (
    <div className="min-w-[1280px] flex justify-between items-center">
      <LeftPanel />
      <Preview />
      <RightPanel />
    </div>
  );
}

export default MainContentsArea;
