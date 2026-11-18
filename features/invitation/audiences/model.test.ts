import {
  buildAudienceGuestUrl,
  MAX_AUDIENCE_NAME_LENGTH,
  normalizeAudienceNameForComparison,
  validateAudienceName,
  validateAudienceSlug,
} from './model';

describe('하객별 초대장 링크 모델', () => {
  it('Drive 속성에 들어가는 한글 대상 이름에서 앞뒤 공백을 허용한다', () => {
    expect(validateAudienceName(` 가족 `)).toBeNull();
    expect(
      validateAudienceName('가'.repeat(MAX_AUDIENCE_NAME_LENGTH))
    ).toBeNull();
    expect(
      validateAudienceName('가'.repeat(MAX_AUDIENCE_NAME_LENGTH + 1))
    ).not.toBeNull();
    expect(validateAudienceName(' 기본 ')).not.toBeNull();
  });

  it('영문 소문자로 시작하는 슬러그만 허용하고 기본 이름을 예약한다', () => {
    expect(validateAudienceSlug(' a9-family ')).toBeNull();
    for (const invalid of [
      '',
      'Family',
      '9-family',
      '가족',
      'base',
      'default',
    ]) {
      expect(validateAudienceSlug(invalid)).not.toBeNull();
    }
  });

  it('한글 조합 방식과 영문 대소문자가 달라도 같은 대상 이름으로 비교한다', () => {
    expect(normalizeAudienceNameForComparison(' 가족 Family ')).toBe(
      normalizeAudienceNameForComparison('가족 family'.normalize('NFD'))
    );
  });

  it('기존 링크의 경로와 다른 매개변수를 유지하면서 하객 구분만 바꾼다', () => {
    const absolute = 'https://invia.test/i/sample?to=old&ref=share#moment';
    expect(buildAudienceGuestUrl(absolute, 'family')).toBe(
      'https://invia.test/i/sample?to=family&ref=share#moment'
    );
    expect(buildAudienceGuestUrl(absolute, '')).toBe(
      'https://invia.test/i/sample?ref=share#moment'
    );
    expect(buildAudienceGuestUrl('/guest/root', null)).toBe('/guest/root');
  });
});
