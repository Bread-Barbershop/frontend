export async function updateFileToDrive(file: File, fileId: string) {
  const response = await fetch('/api/drive/saveData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, payload: JSON.parse(await file.text()) }),
  });
  if (!response.ok)
    throw Object.assign(new Error(`Drive update failed: ${response.status}`), {
      status: response.status,
    });
  return response.json() as Promise<{ fileId: string; name: string }>;
}
