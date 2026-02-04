import 'server-only';
import { NextResponse } from 'next/server';

import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

type Body = { invitationFolderId: string };

const permissionCreateUrl = (folderId: string) =>
  `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
    folderId
  )}/permissions?supportsAllDrives=true&sendNotificationEmail=false&fields=id`;

export async function POST(req: Request) {
  const { invitationFolderId } = (await req.json()) as Partial<Body>;
  if (!invitationFolderId) {
    return NextResponse.json(
      { ok: false, error: 'invitationFolderId required' },
      { status: 400 }
    );
  }

  const { dataJsonFileId } = await ensureDataJsonFile(invitationFolderId);
  const guestUrl = `/guest/${dataJsonFileId}`;

  const res = await googleFetch(permissionCreateUrl(invitationFolderId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'anyone',
      role: 'reader',
      allowFileDiscovery: false,
    }),
    cache: 'no-store',
  });

  if (res.status === 409) {
    return NextResponse.json({
      ok: true,
      guestUrl,
      dataJsonFileId,
      ignored: 'already_public',
    });
  }

  if (!res.ok) {
    const details = await res.json().catch(() => undefined);
    return NextResponse.json(
      {
        ok: false,
        guestUrl,
        dataJsonFileId,
        error: 'publish_failed',
        status: res.status,
        details,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, guestUrl, dataJsonFileId });
}
