import EditorUpdate from './components/EditorUpdate';

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uuid?: string }>;
}) {
  const { id } = await params;
  const { uuid } = await searchParams;
  if (!uuid) {
    // 에러 처리 또는 기본값 설정
    return <div>UUID가 필요합니다.</div>;
  }

  return <EditorUpdate folderId={id} uuid={uuid} />;
}
