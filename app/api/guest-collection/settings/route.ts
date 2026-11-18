import { NextResponse } from 'next/server';

import { assertSameOriginRequest } from '@/app/api/drive/_lib/driveAccess';
import { driveErrorResponse } from '@/app/api/drive/_lib/driveErrorResponse';
import { emptyCollection } from '@/features/invitation/collection/model';

import { failure } from '../_lib/resources';
import { configure, getCollection, hasGrant, ownerTarget } from '../_lib/store';

export async function GET(req: Request) {
  try {
    const { id } = await ownerTarget(
      new URL(req.url).searchParams.get('folder') ?? ''
    );
    const config = await getCollection(id);
    return NextResponse.json(
      config
        ? {
            guestbook: config.guestbook,
            photos: config.photos,
            eventDate: config.eventDate,
            reconnect:
              (config.guestbook || config.photos) &&
              config.closesAt > Date.now() &&
              !(await hasGrant(id)),
          }
        : emptyCollection,
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return driveErrorResponse(e);
  }
}
export async function POST(req: Request) {
  try {
    assertSameOriginRequest(req);
    const body = await req.json();
    const { folder, eventDate, guestbook, photos, consent } = body;
    if (
      typeof folder !== 'string' ||
      typeof eventDate !== 'string' ||
      typeof guestbook !== 'boolean' ||
      typeof photos !== 'boolean'
    )
      failure('접수 설정을 확인해 주세요.', 400);
    await configure(folder, { eventDate, guestbook, photos }, consent === true);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return driveErrorResponse(e);
  }
}
