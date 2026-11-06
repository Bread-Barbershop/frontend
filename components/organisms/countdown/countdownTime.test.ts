import { getCountdownTime, parseSeoulDateTime } from './countdownTime';

describe('D-Day 카운트다운 KST 기준 상태 계산', () => {
  const event = '2027-01-20T11:00';
  it('한국 시간으로 변환하고 비정상 날짜를 거부한다', () => {
    expect(parseSeoulDateTime(event)).toBe(Date.parse('2027-01-20T02:00:00Z'));
    expect(parseSeoulDateTime('2027-02-30T10:00')).toBeNull();
    expect(parseSeoulDateTime('')).toBeNull();
  });
  it('행사 전에는 일시분초를 계산한다', () => {
    expect(getCountdownTime(event, Date.parse('2027-01-19T02:00:00Z'))).toEqual({
      status: 'before', days: 1, hours: 0, minutes: 0, seconds: 0,
    });
  });
  it('행사 당일은 이벤트 전후 구분 없이 행사 당일 상태로 표시한다', () => {
    expect(getCountdownTime(event, Date.parse('2027-01-19T15:00:00Z')).status).toBe('today');
    expect(getCountdownTime(event, Date.parse('2027-01-20T10:00:00Z')).status).toBe('today');
  });
  it('한국 시간 다음 날에는 완료 상태로 전환한다', () => {
    expect(getCountdownTime(event, Date.parse('2027-01-20T15:00:00Z')).status).toBe('after');
    expect(getCountdownTime('', Date.now()).status).toBe('unset');
  });
});
