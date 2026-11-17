import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import TemplateEditorEntry from './TemplateEditorEntry';

import type { SavedData } from '../[id]/types/savedata';
import type { ReactNode } from 'react';

import { loadOriginalPosterJson } from '@/shared/data/invitationTemplates/originalPosterLoader';

jest.mock('@/shared/assets/logo/invia-logo.svg', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/data/invitationTemplates/originalPosterLoader', () => ({
  loadOriginalPosterJson: jest.fn(async () => ({
    version: '7.2.0',
    objects: [
      {
        id: 'original-title',
        type: 'Textbox',
        text: 'Original editable title',
        editable: true,
        styles: [],
      },
    ],
  })),
}));

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockRouter = { replace: mockReplace, refresh: mockRefresh };
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }));
jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ success: jest.fn() }),
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  FabricProvider: ({
    children,
    initialData,
  }: {
    children: ReactNode;
    initialData: string;
  }) => (
    <div data-testid="poster" data-json={initialData}>
      {children}
    </div>
  ),
}));
jest.mock('./MainContentsArea', () => ({
  __esModule: true,
  default: ({ savedData }: { savedData: SavedData }) => (
    <div data-testid="editor" data-blocks={JSON.stringify(savedData.blocks)}>
      제작 준비 완료
    </div>
  ),
}));
jest.mock('@/features/session/components/PrivacyNoticeModal', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <button onClick={onClose}>개인정보 안내 확인</button> : null,
}));
jest.mock('@/features/session/components/LoginModal', () => ({
  __esModule: true,
  default: ({
    open,
    onGoogleLogin,
    onClose,
  }: {
    open: boolean;
    onGoogleLogin: () => void;
    onClose: () => void;
  }) =>
    open ? (
      <div>
        <button onClick={onGoogleLogin}>Google로 계속하기</button>
        <button onClick={onClose}>로그인 취소</button>
      </div>
    ) : null,
}));
jest.mock('@/features/session/components/DrivePermissionRequiredModal', () => ({
  __esModule: true,
  default: ({ open, onRetry }: { open: boolean; onRetry: () => void }) =>
    open ? <button onClick={onRetry}>Drive 권한 다시 연결</button> : null,
}));

describe('선택한 템플릿으로 로그인 후 바로 제작', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(loadOriginalPosterJson)
      .mockReset()
      .mockResolvedValue({
        version: '7.2.0',
        objects: [
          {
            id: 'original-title',
            type: 'Textbox',
            text: 'Original editable title',
            editable: true,
            styles: [],
          },
        ],
      });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isLoggedIn: true }),
    });
    jest.spyOn(window, 'open').mockReturnValue({
      close: jest.fn(),
      focus: jest.fn(),
      closed: false,
    } as unknown as Window);
  });
  afterEach(() => jest.restoreAllMocks());

  const completeOAuth = (data = { type: 'GOOGLE_OAUTH_SUCCESS' }) =>
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', { origin: window.location.origin, data })
      );
    });
  const beginGoogle = async () => {
    await screen.findByRole('button', { name: '개인정보 안내 확인' });
    fireEvent.click(screen.getByRole('button', { name: '개인정보 안내 확인' }));
    fireEvent.click(screen.getByRole('button', { name: 'Google로 계속하기' }));
  };
  const expectChosenData = (id: string) => {
    const blocks = JSON.parse(
      screen.getByTestId('editor').getAttribute('data-blocks')!
    );
    expect(
      blocks.every(
        (block: { props: { collectionStyle: string } }) =>
          block.props.collectionStyle === id
      )
    ).toBe(true);
    const poster = JSON.parse(
      screen.getByTestId('poster').getAttribute('data-json')!
    );
    expect(
      poster.objects.some(
        (object: { type: string }) => object.type === 'Textbox'
      )
    ).toBe(true);
  };

  it('비로그인 상태에서는 인증을 거치고 선택한 생일 템플릿의 실제 편집 데이터로 시작한다', async () => {
    render(
      <TemplateEditorEntry templateId="showcase-18" initialIsLoggedIn={false} />
    );
    await screen.findByRole('heading', { name: '마이 데이 포토' });
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: '초대장을 준비하는 중' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '로그인하고 시작하기' })
    ).toBeEnabled();
    expect(
      screen.getByRole('heading', { name: '마이 데이 포토' })
    ).toBeVisible();
    await beginGoogle();
    completeOAuth();
    await screen.findByTestId('editor');
    expectChosenData('showcase-18');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('로그인 후 서버 인증 상태를 갱신해도 제작 중인 포스터와 블록 ID를 유지한다', async () => {
    const view = render(
      <TemplateEditorEntry templateId="showcase-18" initialIsLoggedIn={false} />
    );
    await beginGoogle();
    completeOAuth();
    await screen.findByTestId('editor');
    expect(mockRefresh).toHaveBeenCalled();
    const poster = screen.getByTestId('poster').getAttribute('data-json');
    const blocks = screen.getByTestId('editor').getAttribute('data-blocks');
    view.rerender(
      <TemplateEditorEntry templateId="showcase-18" initialIsLoggedIn />
    );
    expect(screen.getByTestId('poster')).toHaveAttribute('data-json', poster);
    expect(screen.getByTestId('editor')).toHaveAttribute('data-blocks', blocks);
  });

  it('로그인한 사용자는 추가 확인 없이 선택한 청첩장으로 바로 시작하고, 새로고침에도 같은 디자인을 읽는다', async () => {
    let resolveSession: () => void = () => {};
    global.fetch = jest.fn(
      () =>
        new Promise<Response>(resolve => {
          resolveSession = () =>
            resolve({
              ok: true,
              status: 200,
              json: async () => ({ isLoggedIn: true }),
            } as Response);
        })
    );

    const first = render(
      <TemplateEditorEntry templateId="showcase-0" initialIsLoggedIn />
    );
    expect(
      screen.getByRole('progressbar', { name: '초대장을 준비하는 중' })
    ).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: '클래식 모먼트' })
    ).not.toBeInTheDocument();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    await act(async () => {
      resolveSession();
    });
    await screen.findByTestId('editor');
    expectChosenData('showcase-0');
    first.unmount();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isLoggedIn: true }),
    });
    render(<TemplateEditorEntry templateId="showcase-0" initialIsLoggedIn />);
    await screen.findByTestId('editor');
    expectChosenData('showcase-0');
    expect(window.open).not.toHaveBeenCalled();
  });

  it('기존 세션이 만료되어도 선택 경로를 유지하고 재로그인 후 이어서 제작한다', async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response);
    render(<TemplateEditorEntry templateId="showcase-12" initialIsLoggedIn />);
    await screen.findByRole('button', { name: '개인정보 안내 확인' });
    expect(mockReplace).not.toHaveBeenCalled();
    await beginGoogle();
    completeOAuth();
    await screen.findByTestId('editor');
    expectChosenData('showcase-12');
  });

  it('Drive 권한을 다시 허용하는 흐름에서도 선택한 돌잔치 디자인을 유지한다', async () => {
    render(
      <TemplateEditorEntry templateId="showcase-22" initialIsLoggedIn={false} />
    );
    await beginGoogle();
    completeOAuth({
      type: 'GOOGLE_OAUTH_ERROR',
      reason: 'missing_drive_scope',
    } as { type: string });
    fireEvent.click(
      await screen.findByRole('button', { name: 'Drive 권한 다시 연결' })
    );
    completeOAuth();
    await screen.findByTestId('editor');
    expectChosenData('showcase-22');
  });

  it('로그인을 취소하면 선택한 디자인을 보여주며 다시 시도할 수 있다', async () => {
    render(
      <TemplateEditorEntry templateId="showcase-18" initialIsLoggedIn={false} />
    );
    await screen.findByRole('button', { name: '개인정보 안내 확인' });
    fireEvent.click(screen.getByRole('button', { name: '개인정보 안내 확인' }));
    fireEvent.click(screen.getByRole('button', { name: '로그인 취소' }));
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: '로그인하고 시작하기' })
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '개인정보 안내 확인' })
      ).toBeVisible()
    );
  });

  it('잘못된 ID일 때 인증이나 빈 초대장을 열지 않고 다시 고를 수 있게 한다', () => {
    render(
      <TemplateEditorEntry templateId="unknown" initialIsLoggedIn={false} />
    );
    expect(
      screen.getByRole('heading', { name: '이 템플릿을 찾을 수 없어요.' })
    ).toBeVisible();
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '개인정보 안내 확인' })
    ).not.toBeInTheDocument();
  });

  it('원본 표지 로드 실패를 알리고 다시 시도할 수 있다', async () => {
    jest
      .mocked(loadOriginalPosterJson)
      .mockRejectedValueOnce(new Error('network failure'));
    render(
      <TemplateEditorEntry templateId="showcase-24" initialIsLoggedIn={false} />
    );
    await screen.findByRole('heading', { name: '템플릿을 불러오지 못했어요.' });
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    await screen.findByRole('heading', { name: '브릭 시티 웨딩' });
    expect(loadOriginalPosterJson).toHaveBeenCalledTimes(2);
  });

  it('다른 템플릿을 고르면 먼저 시작한 원본 응답이 화면을 덮지 않는다', async () => {
    let releaseFirstLoad = (value: Record<string, unknown>) => {
      void value;
    };
    jest.mocked(loadOriginalPosterJson).mockImplementationOnce(
      () =>
        new Promise<Record<string, unknown>>(resolve => {
          releaseFirstLoad = resolve;
        })
    );
    const view = render(
      <TemplateEditorEntry templateId="showcase-18" initialIsLoggedIn={false} />
    );

    view.rerender(
      <TemplateEditorEntry templateId="showcase-24" initialIsLoggedIn={false} />
    );
    await screen.findByRole('heading', { name: '브릭 시티 웨딩' });

    await act(async () => {
      releaseFirstLoad({ version: '7.2.0', objects: [] });
    });
    expect(
      screen.getByRole('heading', { name: '브릭 시티 웨딩' })
    ).toBeVisible();
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
  });
});
