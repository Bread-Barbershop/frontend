import { redactSensitiveTelemetry } from './redactSensitiveTelemetry';

describe('민감한 오류 수집 데이터 제거', () => {
  it('업로드 URI와 Google 토큰 및 세션 쿠키를 지운다', () => {
    const value = redactSensitiveTelemetry({
      breadcrumbs: [
        {
          data: {
            url: 'https://www.googleapis.com/upload/drive/v3/files?upload_id=secret-capability',
            headers: {
              Authorization: 'Bearer fake-secret',
              Cookie: 'invia_session=fake',
            },
          },
        },
      ],
      extra: {
        accessToken: 'fake-access',
        refresh_token: 'fake-refresh',
        uploadUrl: 'private-url',
      },
      message:
        'upload failed https://www.googleapis.com/upload/drive/v3/files/file?upload_id=secret-capability',
      status: 503,
    });
    const text = JSON.stringify(value);
    expect(text).not.toMatch(
      /secret-capability|fake-secret|invia_session|fake-access|fake-refresh|private-url/
    );
    expect(value.status).toBe(503);
  });
});
