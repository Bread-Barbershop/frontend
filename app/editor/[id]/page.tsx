import { cookies } from 'next/headers';

import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import Preview from '@/widgets/editor/preview/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import TestButton from './components/TestButton';
// export const dynamic = 'force-static';
// export const revalidate = false;

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  console.log(accessToken);

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    console.log(data);
  } else {
    console.error('에러 발생:', response.status);
  }
  return (
    <FabricProvider>
      <TestButton id={id} />
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
