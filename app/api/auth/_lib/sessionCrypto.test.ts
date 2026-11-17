/** @jest-environment node */
jest.mock('server-only', () => ({}));

import { testEncryptionKey, tokenFixture } from './fixtures/session';
import { decryptRecord, encryptRecord } from './sessionCrypto';

describe('서버 토큰 암호화', () => {
  beforeEach(() => {
    process.env.AUTH_ENCRYPTION_KEY = testEncryptionKey;
  });
  afterEach(() => {
    delete process.env.AUTH_ENCRYPTION_KEY;
  });
  it('매번 다른 암호문을 만들고 토큰을 평문으로 저장하지 않는다', () => {
    const value = encryptRecord(tokenFixture, 'dev:session:a');
    expect(value).not.toContain(tokenFixture.accessToken);
    expect(value).not.toBe(encryptRecord(tokenFixture, 'dev:session:a'));
    expect(decryptRecord(value, 'dev:session:a')).toEqual(tokenFixture);
  });
  it('다른 세션 키로 옮긴 암호문과 변조된 암호문을 거절한다', () => {
    const value = encryptRecord(tokenFixture, 'dev:session:a');
    expect(() => decryptRecord(value, 'dev:session:b')).toThrow();
    const parts = value.split('.');
    parts[3] = Buffer.from('tampered').toString('base64url');
    expect(() => decryptRecord(parts.join('.'), 'dev:session:a')).toThrow();
  });
  it('암호화 키 누락 시 저장하지 않는다', () => {
    delete process.env.AUTH_ENCRYPTION_KEY;
    expect(() => encryptRecord(tokenFixture, 'dev:session:a')).toThrow();
  });
});
