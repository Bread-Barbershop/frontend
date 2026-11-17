import { render } from '@testing-library/react';

import { PREVIEW_MESSAGE } from '@/features/invitation/preview/previewSnapshot';

import DraftInvitationDocument from './DraftInvitationDocument';

const parentPostMessage = jest.fn();
const fakeParent = { postMessage: parentPostMessage } as unknown as Window;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, 'parent', 'get').mockReturnValue(fakeParent);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('DraftInvitationDocument Escape 처리', () => {
  it('갤러리 팝업에서 첫 Escape는 팝업만 닫고 두 번째 Escape는 미리보기를 닫는다', () => {
    render(<DraftInvitationDocument />);

    const galleryDialog = document.createElement('div');
    galleryDialog.setAttribute('role', 'dialog');
    galleryDialog.setAttribute('aria-modal', 'true');
    document.body.appendChild(galleryDialog);

    const dismissGallery = jest.fn(() => galleryDialog.remove());
    // Register after the preview handler to cover the case where its listener runs first.
    window.addEventListener('keydown', dismissGallery);

    try {
      const firstEscape = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
      });
      window.dispatchEvent(firstEscape);

      expect(firstEscape.defaultPrevented).toBe(true);
      expect(dismissGallery).toHaveBeenCalledTimes(1);
      expect(parentPostMessage).not.toHaveBeenCalledWith(
        { type: PREVIEW_MESSAGE.close },
        window.location.origin
      );

      const secondEscape = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
      });
      window.dispatchEvent(secondEscape);

      expect(parentPostMessage).toHaveBeenCalledWith(
        { type: PREVIEW_MESSAGE.close },
        window.location.origin
      );
    } finally {
      window.removeEventListener('keydown', dismissGallery);
      galleryDialog.remove();
    }
  });

  it('열린 네이티브 dialog의 Escape 기본 동작을 유지한다', () => {
    render(<DraftInvitationDocument />);

    const nativeDialog = document.createElement('dialog');
    nativeDialog.setAttribute('open', '');
    document.body.appendChild(nativeDialog);

    try {
      const escape = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
      });
      window.dispatchEvent(escape);

      expect(escape.defaultPrevented).toBe(false);
      expect(parentPostMessage).not.toHaveBeenCalledWith(
        { type: PREVIEW_MESSAGE.close },
        window.location.origin
      );
    } finally {
      nativeDialog.remove();
    }
  });
});
