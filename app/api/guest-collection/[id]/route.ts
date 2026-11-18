import { parse } from 'csv-parse/sync';
import { NextResponse } from 'next/server';

import { assertSameOriginRequest } from '@/app/api/drive/_lib/driveAccess';
import { driveErrorResponse } from '@/app/api/drive/_lib/driveErrorResponse';
import { loadGuestPayload } from '@/app/guest/[id]/server/loadGuestPayload';

import { submitGuest } from '../_lib/guestWrites';
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
        const address = new URL(
          'https://docs.google.com/spreadsheets/d/' +
            encodeURIComponent(c.sheet) +
            '/export'
        );
        address.searchParams.set('format', 'csv');
        address.searchParams.set('gid', String(c.tabId));
        const result = await fetch(address, {
          cache: 'no-store',
          credentials: 'omit',
          signal: AbortSignal.timeout(8000),
        });
        if (
          !result.ok ||
          !result.headers.get('content-type')?.toLowerCase().includes('csv')
        )
          throw new Error('sheet_unavailable');
        const rows: string[][] = parse(await result.text(), {
          bom: true,
          skip_empty_lines: true,
          relax_column_count: true,
        });
        entries = rows
          .filter(row => row.length >= 2 && row[0] && row[1])
          .map(row => row.slice(0, 3))
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
