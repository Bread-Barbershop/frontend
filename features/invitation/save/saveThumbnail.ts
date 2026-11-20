import type { InvitationThumbnail } from '@/shared/types/invitationSave';
import { sha256Hex } from '@/shared/utils/fileUtils';

async function findMatchingThumbnail(
  folderId: string,
  dataUrl: string
): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null;
  try {
    const encoded = dataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
    const checksum = await sha256Hex(bytes.buffer);
    const query = new URLSearchParams({
      invitationFolderId: folderId,
      metadata: '1',
    });
    const response = await fetch(`/api/drive/thumbnail?${query}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const current = await response.json();
    return current.sha256Checksum === checksum &&
      typeof current.thumbnailFileId === 'string'
      ? current.thumbnailFileId
      : null;
  } catch {
    // 해시나 조회를 사용할 수 없어도 기존 업로드 경로에서 저장할 수 있다.
    return null;
  }
}

export async function saveThumbnail(
  invitationFolderId: string,
  thumbnailData: InvitationThumbnail,
  checkExisting: boolean
): Promise<string> {
  if (checkExisting) {
    const currentId = await findMatchingThumbnail(
      invitationFolderId,
      thumbnailData.dataUrl
    );
    if (currentId) return currentId;
  }
  const response = await fetch('/api/drive/thumbnail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitationFolderId, thumbnailData }),
  });
  if (!response.ok)
    throw new Error(`thumbnail save failed: ${response.status}`);
  const result = await response.json();
  if (typeof result?.thumbnailFileId !== 'string' || !result.thumbnailFileId) {
    throw new Error('thumbnail save response missing thumbnailFileId');
  }
  return result.thumbnailFileId;
}
