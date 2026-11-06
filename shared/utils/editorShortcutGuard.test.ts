import { shouldIgnoreEditorShortcut } from './editorShortcutGuard';

describe('편집기 단축키 입력 보호', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.innerWidth = 1440;
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    document
      .querySelectorAll('[data-shortcut-guard-test]')
      .forEach(element => element.remove());
  });

  const createKeyEvent = (
    init: {
      repeat?: boolean;
      ctrlKey?: boolean;
      metaKey?: boolean;
      altKey?: boolean;
      shiftKey?: boolean;
    } = {}
  ) => {
    const event = new KeyboardEvent('keydown', {
      key: '/',
      bubbles: true,
      cancelable: true,
      ...init,
    });
    document.body.dispatchEvent(event);
    return event;
  };

  it('데스크톱 입력 중이 아니면 단축키를 허용한다', () => {
    expect(shouldIgnoreEditorShortcut(createKeyEvent())).toBe(false);
  });

  it('작은 화면에서는 단축키를 무시한다', () => {
    window.innerWidth = 1280;

    expect(shouldIgnoreEditorShortcut(createKeyEvent())).toBe(true);
  });

  it('반복 입력, 조합 입력, 수정키 조합과 이미 처리된 이벤트를 무시한다', () => {
    const events = [
      createKeyEvent({ repeat: true }),
      createKeyEvent({ ctrlKey: true }),
      createKeyEvent({ metaKey: true }),
      createKeyEvent({ altKey: true }),
      createKeyEvent({ shiftKey: true }),
    ];
    const composingEvent = createKeyEvent();
    Object.defineProperty(composingEvent, 'isComposing', { value: true });
    const preventedEvent = createKeyEvent();
    preventedEvent.preventDefault();

    expect(
      [...events, composingEvent, preventedEvent].every(
        shouldIgnoreEditorShortcut
      )
    ).toBe(true);
  });

  it('입력 가능한 요소의 자손에 포커스가 있으면 단축키를 무시한다', () => {
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    editable.dataset.shortcutGuardTest = 'true';
    const child = document.createElement('span');
    editable.append(child);
    document.body.append(editable);

    const event = new KeyboardEvent('keydown', {
      key: '/',
      bubbles: true,
    });
    child.dispatchEvent(event);

    expect(shouldIgnoreEditorShortcut(event)).toBe(true);
  });

  it('대화상자, 메뉴 또는 표시된 팝업이 있으면 단축키를 무시한다', () => {
    const popupSelectors = [
      '[role="dialog"]',
      '[role="menu"]',
      '[data-editor-popup="true"]',
    ];

    popupSelectors.forEach(selector => {
      const popup = document.createElement('div');
      popup.dataset.shortcutGuardTest = 'true';
      if (selector.startsWith('[data-')) {
        popup.setAttribute('data-editor-popup', 'true');
      } else {
        popup.setAttribute(
          'role',
          selector.includes('dialog') ? 'dialog' : 'menu'
        );
      }
      document.body.append(popup);

      expect(shouldIgnoreEditorShortcut(createKeyEvent())).toBe(true);
      popup.remove();
    });
  });
});
