import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'token_endpoint_removed' },
    {
      status: 410,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
