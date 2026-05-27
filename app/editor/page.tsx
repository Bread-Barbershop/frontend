import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import MainContentsArea from './components/MainContentsArea';

const EditorPage = () => {
  return (
    <FabricProvider>
      <div className="w-full h-full bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-x-auto overflow-y-hidden">
        <MainContentsArea />
      </div>
    </FabricProvider>
  );
};
export default EditorPage;
