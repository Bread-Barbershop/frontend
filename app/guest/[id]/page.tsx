import 'server-only';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

function publicDataJsonUrl(fileId: string) {
  // 편집 데이터 읽어오기.
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}

function publicDriveFileUrl(fileId: string) {
  // 초대장 이미지 읽어오기.
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}`;
}

export default async function GuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 편집 데이터 파일 id를 파라미터에서 가져옴.
  const dataJsonFileId = id;

  const res = await fetch(publicDataJsonUrl(dataJsonFileId), {
    next: { tags: [`invitation:${dataJsonFileId}`] }, // 나중에 수동 갱신할 때 해당 태그 사용.
  });

  if (!res.ok) notFound(); // 404 페이지로 리다이렉트.

  const data = await res.json();
  const imageFileIds = Array.isArray(
    (data as { imageFileIds?: unknown }).imageFileIds
  )
    ? (data as { imageFileIds: string[] }).imageFileIds
    : [];

  // 렌더부분 나중에 json 편집데이터 형식 짜이면 그때 파싱해서 조립하는 로직 구현해야 함.
  return (
    <main style={{ padding: 24 }}>
      <h1>Guest Page</h1>
      <div>dataJsonFileId: {dataJsonFileId}</div>
      <div style={{ marginTop: 16 }}>
        <h2>Image cache test</h2>
        <div>imageFileIds: {imageFileIds.length}</div>
        {imageFileIds.length > 0 && (
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              marginTop: 12,
            }}
          >
            {imageFileIds.map(fileId => (
              <figure key={fileId} style={{ margin: 0 }}>
                <Image
                  src={publicDriveFileUrl(fileId)}
                  alt={fileId}
                  width={160}
                  height={160}
                  style={{
                    width: '100%',
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
                <figcaption
                  style={{ fontSize: 12, marginTop: 6, wordBreak: 'break-all' }}
                >
                  {fileId}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
      <pre style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
