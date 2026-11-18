import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import HeaderSupportersButton from './HeaderSupportersButton';

describe('글꼴 제공처 안내', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });

  async function setup() {
    const user = userEvent.setup();
    render(<HeaderSupportersButton className="" />);
    await user.click(screen.getByRole('button', { name: 'Supporters' }));

    const dialog = screen.getByRole('dialog', { name: 'Fonted By' });
    jest
      .spyOn(dialog, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(100, 100, 360, 200));
    return { user, dialog };
  }

  it('바깥 오버레이를 클릭하면 안내를 닫는다', async () => {
    const { user, dialog } = await setup();

    await user.pointer({
      target: dialog,
      keys: '[MouseLeft]',
      coords: { clientX: 50, clientY: 50 },
    });

    expect(dialog).not.toHaveAttribute('open');
  });

  it('안내 패널의 여백을 클릭하면 열린 상태를 유지한다', async () => {
    const { user, dialog } = await setup();

    await user.pointer({
      target: dialog,
      keys: '[MouseLeft]',
      coords: { clientX: 110, clientY: 110 },
    });

    expect(dialog).toHaveAttribute('open');
  });

  it('안에서 누른 포인터를 바깥에서 떼면 열린 상태를 유지한다', async () => {
    const { user, dialog } = await setup();

    await user.pointer([
      {
        target: dialog,
        keys: '[MouseLeft>]',
        coords: { clientX: 110, clientY: 110 },
      },
      {
        target: dialog,
        keys: '[/MouseLeft]',
        coords: { clientX: 50, clientY: 50 },
      },
    ]);

    expect(dialog).toHaveAttribute('open');
  });
});
