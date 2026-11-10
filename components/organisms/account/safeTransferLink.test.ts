import { safeTransferLink } from './safeTransferLink';

describe('safeTransferLink', () => {
  it('accepts HTTPS links for the selected provider', () => {
    expect(safeTransferLink('https://qr.kakaopay.com/abc123', 'kakao')).toContain('qr.kakaopay.com');
    expect(safeTransferLink('https://toss.me/invia', 'toss')).toBe('https://toss.me/invia');
  });
  it('rejects executable or lookalike URLs', () => {
    expect(safeTransferLink('javascript:alert(1)', 'kakao')).toBeNull();
    expect(safeTransferLink('https://qr.kakaopay.com.evil.com/a', 'kakao')).toBeNull();
    expect(safeTransferLink('http://toss.me/test', 'toss')).toBeNull();
    expect(safeTransferLink('https://toss.me@evil.com/a', 'toss')).toBeNull();
    expect(safeTransferLink('https://toss.me/', 'toss')).toBeNull();
  });
});
