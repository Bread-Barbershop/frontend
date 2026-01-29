import 'server-only';
import { notFound } from 'next/navigation';

function publicDataJsonUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}

export default async function GuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dataJsonFileId = id;

  const res = await fetch(publicDataJsonUrl(dataJsonFileId), {
    next: { tags: [`invitation:${dataJsonFileId}`] }, // 나중에 수동 갱신할 때 해당 태그 사용.
  });

  if (!res.ok) notFound();

  const data = await res.json();

  return (
    <main style={{ padding: 24 }}>
      <h1>Guest Page</h1>
      <div>dataJsonFileId: {dataJsonFileId}</div>
      <pre style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
