import EditorUpdate from './components/EditorUpdate';

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uuid: string }>;
}) {
  const { id } = await params;
  const { uuid } = await searchParams;

  return <EditorUpdate folderId={id} uuid={uuid} />;
}
