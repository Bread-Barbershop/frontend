// import {
//   downloadFiles,
//   loadInvitations,
// } from '@/app/api/drive/_lib/invitationService';
import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import Preview from '@/widgets/editor/preview/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

// export const dynamic = 'force-static';
// export const revalidate = false;

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log(id);

  // }
  try {
    // const result = await loadInvitations(id);
    // if (result.files && result.files[0].id) {
    //   result.files.map(async file => {
    //     if (file.mimeType?.includes('floder')) {
    //       const result = await loadInvitations(file.id!);
    //       const jsonFile = await downloadFiles(result.id!);
    //     }
    //     const jsonFile = await downloadFiles(file.id!);
    //   });
    // }
  } catch (err) {
    console.error('초대장 로드 중 에러 발생:', err);
  }
  return (
    <FabricProvider>
      <div className="w-screen h-screen bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-hidden">
        <div className="flex justify-between items-center">
          <LeftPanel />
          <Preview />
          <RightPanel />
        </div>
      </div>
    </FabricProvider>
  );
}
