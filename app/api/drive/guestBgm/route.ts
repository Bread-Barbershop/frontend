// app/api/drive/guestBgm/route.ts
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
  }

  const driveUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;

  const forwardHeaders = new Headers();
  const range = req.headers.get('range');
  if (range) forwardHeaders.set('range', range);

  let driveRes: Response;

  try {
    driveRes = await fetch(driveUrl, {
      redirect: 'follow',
      headers: forwardHeaders,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch from Google Drive' },
      { status: 502 }
    );
  }

  if (!driveRes.ok) {
    return NextResponse.json(
      { error: `Google Drive responded with ${driveRes.status}` },
      { status: 502 }
    );
  }

  const contentType = driveRes.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('audio/')) {
    return NextResponse.json(
      { error: `Unexpected content-type: ${contentType || 'unknown'}` },
      { status: 502 }
    );
  }

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'private, max-age=31536000, immutable');

  const contentLength = driveRes.headers.get('content-length');
  if (contentLength) headers.set('Content-Length', contentLength);

  const etag = driveRes.headers.get('etag');
  if (etag) headers.set('ETag', etag);

  const lastModified = driveRes.headers.get('last-modified');
  if (lastModified) headers.set('Last-Modified', lastModified);

  const acceptRanges = driveRes.headers.get('accept-ranges');
  if (acceptRanges) headers.set('Accept-Ranges', acceptRanges);

  const contentRange = driveRes.headers.get('content-range');
  if (contentRange) headers.set('Content-Range', contentRange);

  return new Response(driveRes.body, {
    status: driveRes.status,
    headers,
  });
}
