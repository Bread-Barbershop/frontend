export const testEncryptionKey = Buffer.alloc(32, 7).toString('base64');
export const tokenFixture = {
  accessToken: 'fake-access',
  refreshToken: 'fake-refresh',
};

export const googleTokenFixture = {
  access_token: 'new-access-token',
  refresh_token: 'new-refresh-token',
  expires_in: 3600,
  scope: 'openid https://www.googleapis.com/auth/drive.file',
};
