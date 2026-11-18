import { collectionClosesAt } from './model';

describe('한국 시간 하객 접수', () => {
  it('예식 3일 뒤 밤까지 열고 D+4 자정에 닫는다', () => {
    expect(collectionClosesAt('2027-01-30')).toBe(
      Date.parse('2027-02-03T00:00:00+09:00')
    );
    expect(collectionClosesAt('2028-02-28')).toBe(
      Date.parse('2028-03-03T00:00:00+09:00')
    );
  });
  it('유효한 예식일만 허용한다', () =>
    expect(collectionClosesAt('2027-02-29')).toBe(0));
});
