import { NextResponse } from 'next/server';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';

export async function GET() {
  const session = await getAuthSession();
  return NextResponse.json(session, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
