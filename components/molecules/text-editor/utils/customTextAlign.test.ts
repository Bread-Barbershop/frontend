import { getInitialEditorStyles, type TextAlignValue } from './textEditorOptions';
import { tiptapJsonToHtmlUniversal } from './tiptapJsonToHtml';

describe('CustomTextAlign 및 정렬 옵션 테스트', () => {
  it('defaultAlign이 center-left인 경우 시작 일렬 가운데 정렬 옵션이 기본값으로 선택된다', () => {
    // Arrange & Act
    const styles = getInitialEditorStyles(null, 'center-left');

    // Assert
    expect(styles.textAlign.value).toBe('center-left');
    expect(styles.textAlign.label).toBe('시작 일렬 가운데');
  });

  it('JSONContent에 textAlign이 center-left인 paragraph가 있으면 정상적으로 추출된다', () => {
    // Arrange
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'center-left' },
          content: [{ type: 'text', text: '테스트 문장' }],
        },
      ],
    };

    // Act
    const styles = getInitialEditorStyles(content, 'center' as TextAlignValue);

    // Assert
    expect(styles.textAlign.value).toBe('center-left');
  });

  it('tiptapJsonToHtmlUniversal을 통해 center-left 문단 변환 시 data-text-align 및 인라인 스타일이 올바르게 렌더링된다', () => {
    // Arrange
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'center-left' },
          content: [
            { type: 'text', text: '🍴 맛있는 음식 준비 완료!' },
            { type: 'hardBreak' },
            { type: 'text', text: '❤️ 마음껏 먹고 즐기다 가세요' },
          ],
        },
      ],
    };

    // Act
    const html = tiptapJsonToHtmlUniversal(content);

    // Assert
    expect(html).toContain('data-text-align="center-left"');
    expect(html).toContain('text-align: left');
    expect(html).toContain('display: table');
    expect(html).toContain('margin-left: auto');
    expect(html).toContain('margin-right: auto');
    expect(html).toContain('🍴 맛있는 음식 준비 완료!');
    expect(html).toContain('❤️ 마음껏 먹고 즐기다 가세요');
  });

  it('기존 center 및 left, right 정렬도 정상적으로 HTML로 변환된다', () => {
    // Arrange
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: '중앙 문장' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [{ type: 'text', text: '우측 문장' }],
        },
      ],
    };

    // Act
    const html = tiptapJsonToHtmlUniversal(content);

    // Assert
    expect(html).toContain('text-align: center');
    expect(html).toContain('text-align: right');
    expect(html).not.toContain('data-text-align="center-left"');
  });

  it('혼합 문단에서도 center-left는 각 문단에 보존되고 기존 center/right 정렬은 유지된다', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'center-left' },
          content: [{ type: 'text', text: '첫 번째 중앙 시작 문장' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: '기존 가운데 정렬 문장' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center-left' },
          content: [{ type: 'text', text: '두 번째 중앙 시작 문장' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [{ type: 'text', text: '기존 오른쪽 정렬 문장' }],
        },
      ],
    };

    const html = tiptapJsonToHtmlUniversal(content);
    expect(html.match(/data-text-align="center-left"/g)).toHaveLength(2);
    expect(html).toContain('text-align: center');
    expect(html).toContain('text-align: right');
    expect(html).toContain('첫 번째 중앙 시작 문장');
    expect(html).toContain('두 번째 중앙 시작 문장');
  });
});
