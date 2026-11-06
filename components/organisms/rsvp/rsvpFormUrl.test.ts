import { safeRsvpFormUrl } from './rsvpFormUrl';

describe('RSVP 구글 설문 링크 검증', () => {
  it('Google Forms 공유 링크만 허용한다', () => {
    expect(safeRsvpFormUrl('https://forms.gle/aBcDe')).toBe('https://forms.gle/aBcDe');
    expect(safeRsvpFormUrl('https://docs.google.com/forms/d/e/example/viewform')).toContain('/forms/');
  });
  it('유사 도메인, HTTP, 스크립트 스킴과 악성 자격 증명을 차단한다', () => {
    expect(safeRsvpFormUrl('http://forms.gle/abc')).toBeNull();
    expect(safeRsvpFormUrl('https://forms.gle.evil.example/abc')).toBeNull();
    expect(safeRsvpFormUrl('javascript:alert(1)')).toBeNull();
    expect(safeRsvpFormUrl('https://bad@forms.gle/abc')).toBeNull();
  });
  it('빈 값과 잘못된 값은 표시하지 않는다', () => {
    expect(safeRsvpFormUrl('')).toBeNull();
    expect(safeRsvpFormUrl(null)).toBeNull();
  });
});
