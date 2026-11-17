import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import HeaderAuthControl from './HeaderAuthControl';
import HeaderPrivacyNoticeButton from './HeaderPrivacyNoticeButton';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));
jest.mock('next/image', () => ({ __esModule: true, default: () => null }));
jest.mock('@/shared/hooks/useConfirm', () => ({
  useConfirm: () => ({ confirm: jest.fn() }),
}));
jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ success: jest.fn() }),
}));
jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: () => false,
}));

function renderControls() {
  return render(
    <>
      <HeaderPrivacyNoticeButton />
      <HeaderAuthControl initialIsLoggedIn={false} />
    </>
  );
}

describe('개인정보 안내와 Google 연결 동의', () => {
  beforeEach(() => {
    jest
      .spyOn(window, 'open')
      .mockReturnValue({
        closed: false,
        focus: jest.fn(),
        close: jest.fn(),
      } as unknown as Window);
  });
  afterEach(() => jest.restoreAllMocks());

  it.each(['알겠어요', 'Escape', '바깥 클릭'])(
    '%s는 안내만 닫고 로그인이나 Google 인증을 시작하지 않는다',
    async method => {
      renderControls();
      fireEvent.click(
        screen.getByRole('button', { name: '개인정보 걱정 없어요' })
      );
      expect(
        screen.getByRole('heading', { name: '안심하고 이용하세요' })
      ).toBeInTheDocument();
      if (method === '알겠어요')
        fireEvent.click(screen.getByRole('button', { name: '알겠어요' }));
      else if (method === 'Escape')
        fireEvent.keyDown(window, { key: 'Escape' });
      else fireEvent.click(screen.getByRole('dialog').parentElement!);
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
      expect(window.open).not.toHaveBeenCalled();
    }
  );

  it('로그인 화면은 쉬운 보관 안내를 먼저 보여주고 동의 버튼에서만 Google 인증을 시작한다', () => {
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(
      screen.getByRole('dialog', { name: 'Google Drive 연결' })
    ).toBeInTheDocument();
    expect(screen.getByText(/최대 30일간 보관/)).toBeInTheDocument();
    expect(screen.queryByText(/Upstash/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '개인정보처리방침 및 연결 해제 방법' })
    ).toHaveAttribute('href', '/policy#google-user-data');
    expect(window.open).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: '동의하고 Google로 계속하기' })
    );
    expect(window.open).toHaveBeenCalledWith(
      '/api/auth/login',
      'google-oauth',
      expect.any(String)
    );
  });

  it.each(['취소', 'Escape', '바깥 클릭'])(
    '로그인 모달의 %s도 동의로 처리하지 않는다',
    async method => {
      renderControls();
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
      if (method === '취소')
        fireEvent.click(screen.getByRole('button', { name: '취소' }));
      else if (method === 'Escape')
        fireEvent.keyDown(document, { key: 'Escape' });
      else
        fireEvent.click(
          screen.getByRole('dialog', { name: 'Google Drive 연결' })
        );
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
      expect(window.open).not.toHaveBeenCalled();
    }
  );
});
