import 'server-only';

export async function tokenRefresh(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? 'refresh_failed');
  }

  return {
    accessToken: data.access_token as string,
    expiresAt: Date.now() + Number(data.expires_in) * 1000,
    refreshToken: (data.refresh_token as string | undefined) ?? undefined,
  };
}
