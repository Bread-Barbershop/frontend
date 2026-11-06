import { safeNavigationUrl } from './navigationUrl';

describe('교통 안내 외부 내비게이션 링크', () => {
  it('신뢰할 수 있는 지도 서비스 HTTPS 주소를 지원한다', () => {
    expect(safeNavigationUrl('https://map.naver.com/p/search/서울')).toContain('map.naver.com');
    expect(safeNavigationUrl('https://map.kakao.com/?q=서울')).toContain('map.kakao.com');
  });
  it('악성 스킴과 피싱 도메인은 차단한다', () => {
    expect(safeNavigationUrl('javascript:alert(1)')).toBeNull();
    expect(safeNavigationUrl('http://map.naver.com/p')).toBeNull();
    expect(safeNavigationUrl('https://map.naver.com.evil.example/')).toBeNull();
    expect(safeNavigationUrl('https://attacker@map.naver.com/path')).toBeNull();
  });
  it('빈 주소는 링크를 렌더링하지 않도록 null을 반환한다', () => {
    expect(safeNavigationUrl('')).toBeNull();
    expect(safeNavigationUrl(undefined)).toBeNull();
  });
});
