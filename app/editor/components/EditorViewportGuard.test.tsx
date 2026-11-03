import { act, render, screen } from '@testing-library/react';

import { SaveModal } from '@/widgets/editor/preview/components/SaveModal';

import EditorViewportGuard from './EditorViewportGuard';

const mockHideAllCallouts = jest.fn();

jest.mock('@/shared/store/useEditorCalloutStore', () => ({
  useEditorCalloutStore: (selector: unknown) =>
    (selector as CallableFunction)({
      hideAllCallouts: mockHideAllCallouts,
    }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@/widgets/editor/preview/components/SaveLottie', () => ({
  SaveLottie: () => <div data-testid="save-lottie" />,
}));

jest.mock('@/features/session/components/HomeButton', () => {
  const MockHomeButton = () => <button type="button">Home</button>;
  MockHomeButton.displayName = 'MockHomeButton';
  return MockHomeButton;
});

jest.mock('@/features/session/components/HeaderPrivacyNoticeButton', () => {
  const MockHeaderPrivacyNoticeButton = () => (
    <button type="button">Privacy</button>
  );
  MockHeaderPrivacyNoticeButton.displayName = 'MockHeaderPrivacyNoticeButton';
  return MockHeaderPrivacyNoticeButton;
});

jest.mock('@/features/session/components/FooterPolicyLink', () => {
  const MockFooterPolicyLink = () => <div>Policy</div>;
  MockFooterPolicyLink.displayName = 'MockFooterPolicyLink';
  return MockFooterPolicyLink;
});

describe('EditorViewportGuard & SaveModal layering', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    jest.clearAllMocks();
    window.innerWidth = 1440;
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  it('renders children and does not render desktop notice when width >= 1340px', () => {
    window.innerWidth = 1440;

    render(
      <EditorViewportGuard>
        <div data-testid="editor-content">Editor Body</div>
      </EditorViewportGuard>
    );

    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: '데스크톱 브라우저 권장 안내' })
    ).not.toBeInTheDocument();
    expect(mockHideAllCallouts).not.toHaveBeenCalled();
  });

  it('renders desktop notice portaled to document.body with z-[40000] when width < 1340px', () => {
    window.innerWidth = 1200;

    render(
      <EditorViewportGuard>
        <div data-testid="editor-content">Editor Body</div>
      </EditorViewportGuard>
    );

    const notice = screen.getByRole('region', {
      name: '데스크톱 브라우저 권장 안내',
    });
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveClass('z-[40000]');
    // verify notice is portaled as a direct child of document.body
    expect(notice.parentElement).toBe(document.body);
    expect(mockHideAllCallouts).toHaveBeenCalled();
  });

  it('ensures SaveModal stays behind the desktop notice when screen shrinks below 1340px', () => {
    window.innerWidth = 1440;

    const { rerender } = render(
      <EditorViewportGuard>
        <div data-testid="editor-content">Editor Body</div>
        <SaveModal
          isLoading={true}
          isFail={false}
          pendingInvitation={null}
          loadingMessage="소중한 사진을 불러오고 있어요"
          retry={jest.fn()}
          onClose={jest.fn()}
        />
      </EditorViewportGuard>
    );

    // SaveModal is rendered in document.body
    const saveModal = screen.getByRole('dialog');
    expect(saveModal).toBeInTheDocument();
    expect(saveModal).toHaveClass('z-[101]');
    expect(screen.getByText('소중한 사진을 불러오고 있어요')).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: '데스크톱 브라우저 권장 안내' })
    ).not.toBeInTheDocument();

    // Now resize screen width to 1200px (< 1340px)
    act(() => {
      window.innerWidth = 1200;
      window.dispatchEvent(new Event('resize'));
    });

    rerender(
      <EditorViewportGuard>
        <div data-testid="editor-content">Editor Body</div>
        <SaveModal
          isLoading={true}
          isFail={false}
          pendingInvitation={null}
          loadingMessage="소중한 사진을 불러오고 있어요"
          retry={jest.fn()}
          onClose={jest.fn()}
        />
      </EditorViewportGuard>
    );

    const notice = screen.getByRole('region', {
      name: '데스크톱 브라우저 권장 안내',
    });
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveClass('z-[40000]');

    // Both are direct children of document.body
    expect(notice.parentElement).toBe(document.body);
    expect(saveModal.parentElement).toBe(document.body);

    // Notice has z-[40000] and SaveModal has z-[101], so notice stacks on top
    const noticeZIndex = parseInt(
      notice.className.match(/z-\[(\d+)\]/)?.[1] ?? '0',
      10
    );
    const saveModalZIndex = parseInt(
      saveModal.className.match(/z-\[(\d+)\]/)?.[1] ?? '0',
      10
    );
    expect(noticeZIndex).toBeGreaterThan(saveModalZIndex);
  });

  it('restores editor view and unmounts notice when screen is widened back >= 1340px', () => {
    window.innerWidth = 1000;

    const { rerender } = render(
      <EditorViewportGuard>
        <div data-testid="editor-content">Editor Body</div>
        <SaveModal
          isLoading={true}
          isFail={false}
          pendingInvitation={null}
          loadingMessage="소중한 사진을 불러오고 있어요"
          retry={jest.fn()}
          onClose={jest.fn()}
        />
      </EditorViewportGuard>
    );

    expect(
      screen.getByRole('region', { name: '데스크톱 브라우저 권장 안내' })
    ).toBeInTheDocument();

    // Expand width back to 1440px
    act(() => {
      window.innerWidth = 1440;
      window.dispatchEvent(new Event('resize'));
    });

    rerender(
      <EditorViewportGuard>
        <div data-testid="editor-content">Editor Body</div>
        <SaveModal
          isLoading={true}
          isFail={false}
          pendingInvitation={null}
          loadingMessage="소중한 사진을 불러오고 있어요"
          retry={jest.fn()}
          onClose={jest.fn()}
        />
      </EditorViewportGuard>
    );

    expect(
      screen.queryByRole('region', { name: '데스크톱 브라우저 권장 안내' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('소중한 사진을 불러오고 있어요')
    ).toBeInTheDocument();
  });
});
