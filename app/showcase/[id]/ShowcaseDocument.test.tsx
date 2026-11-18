import { act, render, screen } from '@testing-library/react';

import { buildShowcaseInvitation } from '@/shared/data/buildShowcaseInvitation';
import { SHOWCASE_INVITATIONS } from '@/shared/data/showcaseInvitations';

import ShowcaseDocument from './ShowcaseDocument';

jest.mock('@/app/guest/[id]/components/GuestRenderer', () => ({
  __esModule: true,
  default: () => <p>편집 가능한 초대장 본문</p>,
}));

describe('디자인마다 바로 읽을 수 있는 초대장', () => {
  it.each([0, 1, 4, 12, 18, 20, 22])(
    '디자인 %i는 공통 봉투 모션 없이 고유 표지와 본문을 바로 보여준다',
    index => {
      const design = SHOWCASE_INVITATIONS[index];
      render(
        <ShowcaseDocument
          design={design}
          {...buildShowcaseInvitation(design)}
        />
      );
      expect(
        screen.getByRole('img', { name: `${design.name} 포스터 미리보기` })
      ).toBeVisible();
      expect(screen.getByText('편집 가능한 초대장 본문')).toBeVisible();
      expect(
        screen.queryByRole('button', { name: /초대장 열기/ })
      ).not.toBeInTheDocument();
    }
  );

  it('모바일 미리보기에서는 포스터 전체를 맞추고 데스크톱 너비에서 원래 크기로 돌아간다', () => {
    const frame = document.createElement('iframe');
    frame.setAttribute('data-showcase-preview', '');
    const frameElement = jest
      .spyOn(window, 'frameElement', 'get')
      .mockReturnValue(frame);
    const query = Object.assign(new EventTarget(), { matches: true });
    const matchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => query,
    });
    const design = SHOWCASE_INVITATIONS[0];

    try {
      render(
        <ShowcaseDocument design={design} {...buildShowcaseInvitation(design)} />
      );
      const poster = screen.getByRole('img', {
        name: `${design.name} 포스터 미리보기`,
      });
      expect(poster).toHaveClass('object-contain');
      expect(poster.closest('header')).toHaveClass('h-screen');

      act(() => {
        query.matches = false;
        query.dispatchEvent(new Event('change'));
      });
      expect(poster).toHaveClass('object-cover');
      expect(poster.closest('header')).not.toHaveClass('h-screen');
    } finally {
      if (matchMedia) Object.defineProperty(window, 'matchMedia', matchMedia);
      else Reflect.deleteProperty(window, 'matchMedia');
      frameElement.mockRestore();
    }
  });

  it('사진 팝업에서 누른 Escape가 바깥 미리보기까지 닫지 않게 한다', () => {
    const design = SHOWCASE_INVITATIONS[0];
    render(
      <ShowcaseDocument design={design} {...buildShowcaseInvitation(design)} />
    );
    const popup = document.createElement('div');
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    document.body.appendChild(popup);
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    popup.remove();
  });
});
