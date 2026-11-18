import { NextResponse } from 'next/server';

import { assertSameOriginRequest } from '@/app/api/drive/_lib/driveAccess';
import { driveErrorResponse } from '@/app/api/drive/_lib/driveErrorResponse';
import { loadGuestPayload } from '@/app/guest/[id]/server/loadGuestPayload';

import { submitGuest } from '../_lib/guestWrites';
import { sheets } from '../_lib/resources';
import { getCollection, hasGrant } from '../_lib/store';

type Context = { params: Promise<{ id: string }> };
const headers = { 'Cache-Control': 'no-store' };
export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const c = await getCollection(id);
    if (
      !c ||
      (!c.sheet && !c.photos) ||
      (await loadGuestPayload(id)).status !== 'ok'
    )
      return NextResponse.json(null, { headers });
    let entries: string[][] = [];
    let readFailed = false;
    if (c.sheet) {
      try {
        const result = await fetch(`${sheets}/${c.sheet}/values/A:C`, {
          headers: {
            'X-Goog-Api-Key': process.env.GOOGLE_SHEETS_READ_API_KEY ?? '',
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });
        if (!result.ok) throw new Error();
        const data = await result.json();
        entries = (data.values ?? [])
          .filter((row: unknown) => Array.isArray(row) && row.length >= 2)
          .reverse();
      } catch {
        readFailed = true;
      }
    }
    const reconnect =
      (c.guestbook || c.photos) &&
      Date.now() < c.closesAt &&
      !(await hasGrant(id));
    return NextResponse.json(
      {
        guestbook: c.guestbook,
        photos: c.photos,
        hasBook: Boolean(c.sheet),
        closesAt: c.closesAt,
        entries,
        readFailed,
        reconnect,
      },
      { headers }
    );
  } catch (e) {
    return driveErrorResponse(e);
  }
}
export async function POST(req: Request, { params }: Context) {
  try {
    assertSameOriginRequest(req);
    const { id } = await params;
    return NextResponse.json(await submitGuest(req, id, await req.json()), {
      headers,
    });
  } catch (e) {
    return driveErrorResponse(e);
  }
}
