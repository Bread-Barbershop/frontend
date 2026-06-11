import 'server-only';
import { NextResponse } from 'next/server';

import { guestPath, probeGuestData } from '@/app/api/drive/_lib/guestReadiness';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataJsonFileId = searchParams.get('dataJsonFileId');

  if (!dataJsonFileId) {
    return NextResponse.json(
      { ok: false, error: 'dataJsonFileId required' },
      { status: 400 }
    );
  }

  const guestUrl = guestPath(dataJsonFileId);
  const probe = await probeGuestData(dataJsonFileId);

  if (probe.ok) {
    return NextResponse.json({
      ok: true,
      published: true,
      ready: true,
      guestUrl,
      dataJsonFileId,
      details: probe,
    });
  }

  return NextResponse.json(
    {
      ok: true,
      published: true,
      ready: false,
      guestUrl,
      dataJsonFileId,
      warning: 'guest_not_ready',
      status: 202,
      details: probe,
    },
    { status: 202 }
  );
}
