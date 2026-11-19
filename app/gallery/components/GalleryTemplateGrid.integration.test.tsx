import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';

import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';

import GalleryTemplateGrid from './GalleryTemplateGrid';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

function renderGallery(category?: string, largePrintOnly = false) {
  const searchParams = new URLSearchParams(category ? { category } : {});
  if (largePrintOnly) searchParams.set('largePrint', '1');
  jest
    .mocked(useSearchParams)
    .mockReturnValue(searchParams as ReadonlyURLSearchParams);
  render(<GalleryTemplateGrid />);
}

describe('초대장 갤러리', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });

  it.each(['all', 'wedding', 'birthday', 'seminar', 'firstBirthday'])(
    '%s 카테고리에 공용 카탈로그의 모든 해당 디자인을 표시한다',
    category => {
      renderGallery(category);
      const grid = screen.getByRole('region', { name: '초대장 디자인' });
      const templates = INVITATION_TEMPLATES.filter(
        template => category === 'all' || template.type === category
      );

      expect(within(grid).getAllByRole('button')).toHaveLength(
        templates.length
      );
      for (const template of templates) {
        const poster = within(grid).getByAltText(
          `${template.name} 포스터 미리보기`
        );
        const imagePath = decodeURIComponent(poster.getAttribute('src') ?? '');
        expect(imagePath).toContain(template.posterImage);
      }
    }
  );

  it('선택한 최신 디자인의 본문을 열고 같은 카테고리 안에서 탐색한다', async () => {
    const user = userEvent.setup();
    renderGallery('seminar');

    await user.click(screen.getByRole('button', { name: '커피 감각 연구소' }));
    await user.click(screen.getByRole('button', { name: '디자인 미리보기' }));

    const dialog = screen.getByRole('dialog', { name: '커피 감각 연구소' });
    expect(
      within(dialog).getByTitle('커피 감각 연구소 초대장 내용')
    ).toHaveAttribute('src', '/showcase/showcase-40');
    await user.click(
      within(dialog).getByRole('button', { name: '다음 초대장' })
    );
    expect(screen.getByTitle('볼드 비즈니스 초대장 내용')).toHaveAttribute(
      'src',
      '/showcase/showcase-12'
    );
  });

  it('큰 글씨 생일 디자인만 모아서 하객 미리보기 안에서도 같은 목록을 순환한다', async () => {
    const user = userEvent.setup();
    renderGallery('birthday', true);
    expect(screen.queryByRole('button', { name: '생신 꽃편지' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '팔순 가족 잔치' }));
    await user.click(screen.getByRole('button', { name: '디자인 미리보기' }));
    await user.click(screen.getByRole('button', { name: '다음 초대장' }));
    expect(screen.getByTitle('칠순 감사연 초대장 내용')).toHaveAttribute(
      'src',
      '/showcase/showcase-42'
    );
  });

  it('미리보기 안에서 바깥으로 드래그하면 유지하고 바깥을 클릭하면 닫는다', async () => {
    const user = userEvent.setup();
    renderGallery('seminar');

    await user.click(screen.getByRole('button', { name: '커피 감각 연구소' }));
    const previewButton = screen.getByRole('button', {
      name: '디자인 미리보기',
    });
    await user.click(previewButton);
    const dialog = screen.getByRole('dialog', { name: '커피 감각 연구소' });
    const title = within(dialog).getByRole('heading', {
      name: '커피 감각 연구소',
    });

    await user.pointer([
      { target: title, keys: '[MouseLeft>]' },
      { target: dialog, keys: '[/MouseLeft]' },
    ]);
    expect(dialog).toBeVisible();

    await user.click(dialog);
    expect(dialog).not.toBeInTheDocument();
    expect(previewButton).toHaveFocus();
  });

  it('제작 동작을 선택한 템플릿의 새 작성 경로에 연결한다', async () => {
    const user = userEvent.setup();
    renderGallery('seminar');

    await user.click(screen.getByRole('button', { name: '커피 감각 연구소' }));

    expect(
      screen.getByRole('link', { name: '이 디자인으로 만들기' })
    ).toHaveAttribute('href', '/editor?template=showcase-40');
  });
});
