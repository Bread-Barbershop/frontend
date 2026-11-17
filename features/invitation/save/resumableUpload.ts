const CHUNK_SIZE = 8 * 256 * 1024;

async function api(path: string, body: unknown) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw Object.assign(new Error(`Drive upload failed: ${response.status}`), {
      status: response.status,
    });
  return response.json();
}

export function uploadedOffset(range: string | null) {
  const match = range?.match(/^bytes=0-(\d+)$/);
  return match ? Number(match[1]) + 1 : 0;
}

/** The session URI is a scoped capability; never log it or add a Google Bearer token. */
export async function resumableUpload(
  file: File,
  folderId: string,
  dataJsonFileId?: string
) {
  const digest = Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
    ),
    byte => byte.toString(16).padStart(2, '0')
  ).join('');
  const metadata = {
    folderId,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    digest,
    ...(dataJsonFileId ? { dataJsonFileId } : {}),
  };
  for (let restart = 0; restart < 2; restart++) {
    const session = await api('/api/drive/uploadSession', {
      ...metadata,
      restart: restart > 0,
    });
    if (session.complete)
      return api('/api/drive/uploadComplete', { uploadId: session.uploadId });
    const url = new URL(session.uploadUrl);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'www.googleapis.com' ||
      !url.pathname.startsWith('/upload/drive/v3/files')
    )
      throw new Error('Invalid upload session');
    let response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Range': `bytes */${file.size}` },
      body: new Blob([]),
      credentials: 'omit',
    });
    if (response.status === 404 || response.status === 410) continue;
    let offset =
      response.status === 308
        ? uploadedOffset(response.headers.get('range'))
        : 0;
    if (!response.ok && response.status !== 308)
      throw Object.assign(
        new Error(`Drive upload failed: ${response.status}`),
        { status: response.status }
      );
    if (response.ok)
      return api('/api/drive/uploadComplete', { uploadId: session.uploadId });
    while (offset < file.size) {
      const end = Math.min(offset + CHUNK_SIZE, file.size);
      response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Content-Range': `bytes ${offset}-${end - 1}/${file.size}`,
        },
        body: file.slice(offset, end),
        credentials: 'omit',
      });
      if (response.ok)
        return api('/api/drive/uploadComplete', { uploadId: session.uploadId });
      if (response.status !== 308)
        throw Object.assign(
          new Error(`Drive upload failed: ${response.status}`),
          { status: response.status }
        );
      const next = uploadedOffset(response.headers.get('range'));
      if (next <= offset || next > file.size)
        throw new Error('Upload did not advance');
      offset = next;
    }
  }
  throw new Error('업로드 연결이 만료됐습니다. 다시 저장해 주세요.');
}
