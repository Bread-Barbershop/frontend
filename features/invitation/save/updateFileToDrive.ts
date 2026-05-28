export async function updateFileToDrive(
  file: File,
  fileId: string,
  accessToken: string
) {
  const boundary = '-------314159265358979323846';

  const body = await buildMultipartBodyForUpdate(file, boundary);

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!res.ok) {
    throw new Error(`Drive update failed: ${res.status}`);
  }

  const { id, name } = await res.json();
  return { fileId: id, name };
}

async function buildMultipartBodyForUpdate(
  file: File,
  boundary: string
): Promise<Blob> {
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: file.name,
    mimeType: file.type,
  };

  const encoder = new TextEncoder();

  const fileBuffer = await file.arrayBuffer();

  const metadataPart = encoder.encode(
    delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${file.type}\r\n\r\n`
  );

  const closePart = encoder.encode(closeDelimiter);

  return new Blob([metadataPart, fileBuffer, closePart]);
}
