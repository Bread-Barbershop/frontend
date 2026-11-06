import { safeRsvpFormUrl } from './rsvpFormUrl';

describe('RSVP 구글 설문 링크 검증', () => {
  it('응답자용 단축 링크와 기본·레거시 설문 링크를 허용한다', () => {
    expect(safeRsvpFormUrl('https://forms.gle/aBcDe')).toBe(
      'https://forms.gle/aBcDe'
    );
    expect(
      safeRsvpFormUrl('https://docs.google.com/forms/d/e/example/viewform')
    ).toBe('https://docs.google.com/forms/d/e/example/viewform');
    expect(
      safeRsvpFormUrl('https://docs.google.com/forms/d/example/viewform')
    ).toBe('https://docs.google.com/forms/d/example/viewform');
    expect(
      safeRsvpFormUrl('https://docs.google.com/forms/u/0/d/e/example/viewform')
    ).toBe('https://docs.google.com/forms/u/0/d/e/example/viewform');
  });

  it('사전 입력 쿼리를 응답자 링크에 보존한다', () => {
    const url =
      'https://docs.google.com/forms/d/e/example/viewform?usp=pp_url&entry.123=guest';

    expect(safeRsvpFormUrl(url)).toBe(url);
  });

  it('루트 링크와 설문 관리 경로를 거절한다', () => {
    expect(safeRsvpFormUrl('https://forms.gle')).toBeNull();
    expect(safeRsvpFormUrl('https://forms.gle/')).toBeNull();
    expect(safeRsvpFormUrl('https://forms.gle/edit')).toBeNull();
    expect(safeRsvpFormUrl('https://docs.google.com/forms')).toBeNull();
    expect(safeRsvpFormUrl('https://docs.google.com/forms/')).toBeNull();
    expect(
      safeRsvpFormUrl('https://docs.google.com/forms/d/example/edit')
    ).toBeNull();
    expect(
      safeRsvpFormUrl('https://docs.google.com/forms/d/example/responses')
    ).toBeNull();
    expect(safeRsvpFormUrl('https://docs.google.com/forms/create')).toBeNull();
  });

  it('유사 도메인, HTTP, 스크립트 스킴과 악성 자격 증명을 차단한다', () => {
    expect(safeRsvpFormUrl('http://forms.gle/abc')).toBeNull();
    expect(safeRsvpFormUrl('https://forms.gle.evil.example/abc')).toBeNull();
    expect(safeRsvpFormUrl('javascript:alert(1)')).toBeNull();
    expect(safeRsvpFormUrl('https://bad@forms.gle/abc')).toBeNull();
    expect(
      safeRsvpFormUrl('https://docs.google.com:8443/forms/d/e/id/viewform')
    ).toBeNull();
    expect(safeRsvpFormUrl(`https://forms.gle/${'a'.repeat(2049)}`)).toBeNull();
  });
  it('빈 값과 잘못된 값은 표시하지 않는다', () => {
    expect(safeRsvpFormUrl('')).toBeNull();
    expect(safeRsvpFormUrl(null)).toBeNull();
  });
});
