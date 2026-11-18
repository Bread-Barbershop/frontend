import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShowcasePreviewProvider, {
  useShowcasePreview,
} from './ShowcasePreviewProvider';

function SampleCard() {
  const openPreview = useShowcasePreview();
  return (
    <>
      <button onClick={() => openPreview('showcase-22')}>
        민준이의 첫 초대 미리보기
      </button>
      <button onClick={() => openPreview('showcase-40')}>
        마지막 초대장 미리보기
      </button>
    </>
  );
}

describe('초대장 카드 미리보기', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });

  it('기존 카드에서 새 컬렉션으로 이동하고 첫 카드로 순환한다', async () => {
    const user = userEvent.setup();
    render(
      <ShowcasePreviewProvider>
        <SampleCard />
      </ShowcasePreviewProvider>
    );
    await user.click(
      screen.getByRole('button', { name: '민준이의 첫 초대 미리보기' })
    );
    const expectCurrentInvitation = (name: string, id: string) => {
      expect(screen.getByRole('dialog', { name })).toBeVisible();
      expect(screen.getByTitle(`${name} 초대장 내용`)).toHaveAttribute(
        'src',
        `/showcase/${id}`
      );
      expect(
        screen.getByRole('link', { name: '이 템플릿으로 시작하기' })
      ).toHaveAttribute('href', `/editor?template=${id}`);
    };

    expectCurrentInvitation('민준이의 첫 초대', 'showcase-22');
    await user.click(screen.getByRole('button', { name: '다음 초대장' }));
    expectCurrentInvitation('알파인 프로미스', 'showcase-23');
    await user.click(screen.getByRole('button', { name: '다음 초대장' }));
    expectCurrentInvitation('브릭 시티 웨딩', 'showcase-24');
    await user.click(screen.getByRole('button', { name: '다음 초대장' }));
    expectCurrentInvitation('비단에 담은 첫돌', 'showcase-25');
    await user.click(screen.getByRole('button', { name: '미리보기 닫기' }));
    await user.click(
      screen.getByRole('button', { name: '마지막 초대장 미리보기' })
    );
    expectCurrentInvitation('커피 감각 연구소', 'showcase-40');
    await user.click(screen.getByRole('button', { name: '다음 초대장' }));
    expectCurrentInvitation('클래식 모먼트', 'showcase-0');
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
