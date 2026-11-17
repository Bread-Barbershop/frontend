import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShowcasePreviewProvider, {
  useShowcasePreview,
} from './ShowcasePreviewProvider';

function SampleCard() {
  const openPreview = useShowcasePreview();
  return (
    <button onClick={() => openPreview('showcase-22')}>
      민준이의 첫 초대 미리보기
    </button>
  );
}

describe('첫 화면 카드 미리보기', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });

  it('선택한 카드의 초대장을 열고 마지막에서 첫 번째 샘플로 이동한다', async () => {
    const user = userEvent.setup();
    render(
      <ShowcasePreviewProvider>
        <SampleCard />
      </ShowcasePreviewProvider>
    );
    await user.click(
      screen.getByRole('button', { name: '민준이의 첫 초대 미리보기' })
    );
    expect(
      screen.getByRole('dialog', { name: '민준이의 첫 초대' })
    ).toBeVisible();
    expect(screen.getByTitle('민준이의 첫 초대 초대장 내용')).toHaveAttribute(
      'src',
      '/showcase/showcase-22'
    );
    expect(
      screen.getByRole('link', { name: '이 템플릿으로 시작하기' })
    ).toHaveAttribute('href', '/editor?template=showcase-22');
    await user.click(screen.getByRole('button', { name: '다음 초대장' }));
    expect(screen.getByRole('dialog', { name: '클래식 모먼트' })).toBeVisible();
    expect(screen.getByTitle('클래식 모먼트 초대장 내용')).toHaveAttribute(
      'src',
      '/showcase/showcase-0'
    );
    expect(
      screen.getByRole('link', { name: '이 템플릿으로 시작하기' })
    ).toHaveAttribute('href', '/editor?template=showcase-0');
  });

  it('닫으면 카드에 포커스를 돌려주고 원래 스크롤 상태를 복구한다', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'auto';
    render(
      <ShowcasePreviewProvider>
        <SampleCard />
      </ShowcasePreviewProvider>
    );
    const card = screen.getByRole('button', {
      name: '민준이의 첫 초대 미리보기',
    });
    await user.click(card);
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(screen.getByRole('button', { name: '미리보기 닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(card).toHaveFocus();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });

  it('PC 제작 안내를 확인하면 보고 있던 초대장으로 돌아간다', async () => {
    const user = userEvent.setup();
    render(
      <ShowcasePreviewProvider>
        <SampleCard />
      </ShowcasePreviewProvider>
    );
    await user.click(
      screen.getByRole('button', { name: '민준이의 첫 초대 미리보기' })
    );
    const preview = screen.getByTitle('민준이의 첫 초대 초대장 내용');

    await user.click(screen.getByRole('button', { name: '이거 쓸래요' }));
    expect(
      screen.getByRole('dialog', { name: '민준이의 첫 초대 시작하기' })
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: '알겠어요' }));

    expect(
      screen.queryByRole('dialog', { name: '민준이의 첫 초대 시작하기' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: '민준이의 첫 초대' })
    ).toBeVisible();
    expect(screen.getByTitle('민준이의 첫 초대 초대장 내용')).toBe(preview);
  });

  it('초대장 iframe에서 온 Escape 메시지만 받아 미리보기를 닫는다', async () => {
    const user = userEvent.setup();
    render(
      <ShowcasePreviewProvider>
        <SampleCard />
      </ShowcasePreviewProvider>
    );
    await user.click(
      screen.getByRole('button', { name: '민준이의 첫 초대 미리보기' })
    );
    const iframe = screen.getByTitle(
      '민준이의 첫 초대 초대장 내용'
    ) as HTMLIFrameElement;
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: 'https://unrelated.example',
        data: { type: 'invia:close-showcase' },
        source: iframe.contentWindow,
      })
    );
    expect(screen.getByRole('dialog')).toBeVisible();
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: 'invia:close-showcase' },
        source: iframe.contentWindow,
      })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
