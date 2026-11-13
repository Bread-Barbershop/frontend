import {
  getTodayKstDateString,
  isValidDateTimeLocal,
  parseSeoulDateTimeToTimestamp,
  parseStrictDate,
} from './dateValidation';

describe('날짜와 행사 일시 검증', () => {
  it.each([
    '0001-01-01',
    '2024-02-29',
    '2000-02-29',
    '9999-12-31',
  ])('유효한 날짜 %s를 허용한다', value => {
    expect(parseStrictDate(value)).not.toBeNull();
  });

  it.each([
    '0000-01-01',
    '2026-00-01',
    '2026-13-01',
    '2026-01-00',
    '2026-11-00',
    '2027-00-00',
    '2026-04-31',
    '2026-02-30',
    '1900-02-29',
    '2026-3-09',
  ])('잘못된 날짜 %s를 거부한다', value => {
    expect(parseStrictDate(value)).toBeNull();
  });

  it('점으로 입력한 아이 생일도 엄격히 검증한다', () => {
    expect(parseStrictDate('2000.02.29', '.')).toEqual({
      year: 2000,
      month: 2,
      day: 29,
    });
    expect(parseStrictDate('1900.02.29', '.')).toBeNull();
  });

  it.each([
    ['0001-01-01T00:00', true],
    ['2000-02-29T00:00', true],
    ['2027-01-20T23:59', true],
    ['0000-01-01T00:00', false],
    ['2027-02-30T10:00', false],
    ['2027-01-20T24:00', false],
    ['2027-01-20T10:60', false],
    ['2027-01-20T10:00:00', false],
  ])('행사 일시 %s의 유효성은 %s이다', (value, expected) => {
    expect(isValidDateTimeLocal(value)).toBe(expected);
  });

  it('KST 날짜를 기준으로 오늘을 계산하고 로컬 시간대 영향을 받지 않는다', () => {
    const utcTimestamp = Date.parse('2026-11-07T15:30:00Z');

    expect(getTodayKstDateString(utcTimestamp)).toBe('2026-11-08');
    expect(parseSeoulDateTimeToTimestamp('2027-01-20T11:00')).toBe(
      Date.parse('2027-01-20T02:00:00Z')
    );
  });
});
