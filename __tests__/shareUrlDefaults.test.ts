import {
  DEFAULT_IMAGE_URL,
  resolveShareImageUrl,
} from '@/shared/utils/shareUrlDefaults';

describe('resolveShareImageUrl', () => {
  it('returns default absolute url when imageFileId is missing', () => {
    expect(resolveShareImageUrl(undefined, 'http://localhost:3000')).toBe(
      `http://localhost:3000${DEFAULT_IMAGE_URL}`
    );
  });

  it('returns default absolute url when imageFileId is empty string', () => {
    expect(resolveShareImageUrl('', 'http://localhost:3000')).toBe(
      `http://localhost:3000${DEFAULT_IMAGE_URL}`
    );
  });

  it('returns default absolute url when imageFileId is whitespace', () => {
    expect(resolveShareImageUrl('   ', 'http://localhost:3000')).toBe(
      `http://localhost:3000${DEFAULT_IMAGE_URL}`
    );
  });

  it('returns drive url when imageFileId exists', () => {
    expect(resolveShareImageUrl('abc123', 'http://localhost:3000')).toBe(
      'https://lh3.googleusercontent.com/d/abc123'
    );
  });

  it('returns relative default url only when origin is missing', () => {
    expect(resolveShareImageUrl(undefined)).toBe(DEFAULT_IMAGE_URL);
  });
});
