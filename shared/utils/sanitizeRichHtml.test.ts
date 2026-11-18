import { UNSAFE_RICH_HTML } from './fixtures/richHtml';
import { sanitizeRichHtml } from './sanitizeRichHtml';

describe('sanitizeRichHtml', () => {
  it.each(UNSAFE_RICH_HTML)('스크립트와 위험한 속성을 제거한다: %s', html => {
    const element = document.createElement('div');
    element.innerHTML = sanitizeRichHtml(html);
    expect(element.querySelector('img,svg,script,iframe')).toBeNull();
    expect(element.innerHTML).not.toMatch(
      /onerror|onload|javascript:|position:|background-image/i
    );
  });

  it('기존 문구의 정렬·색상·글자 서식을 유지한다', () => {
    const safe = sanitizeRichHtml(
      '<p style="text-align: center"><strong><span style="color: rgb(10, 20, 30); font-size: 24px">초대합니다</span></strong></p>'
    );
    expect(safe).toContain('<strong>');
    expect(safe).toContain('text-align: center');
    expect(safe).toContain('font-size: 24px');
    expect(safe).toContain('초대합니다');
  });

  it('새 창 링크에 opener 접근 차단을 적용한다', () => {
    expect(
      sanitizeRichHtml('<a href="https://example.com" target="_blank">안내</a>')
    ).toContain('rel="noopener noreferrer"');
  });
});
