import { act, fireEvent, render, screen, within } from '@testing-library/react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';
import { MealMenuBlock } from '@/components/organisms/mealMenu/MealMenuBlock';
import { MealMenuPreview } from '@/components/organisms/mealMenu/MealMenuPreview';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import AddPageButton from './AddPageButton';

jest.mock('next/navigation', () => ({ usePathname: () => '/i/example' }));
jest.mock('@/widgets/editor/preview/hooks/useInvitationTemplate', () => ({
  useInvitationTemplate: () => ({
    applyTemplate: jest.fn(),
    isApplying: false,
  }),
}));

function MenuEditor() {
  const block = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'mealMenu'>;
  return (
    <>
      <MealMenuBlock blockInfo={block} id={block.id} />
      <MealMenuPreview blockInfo={block} />
    </>
  );
}

describe('식사 메뉴 블록', () => {
  const originalWidth = window.innerWidth;
  const originalObserver = window.IntersectionObserver;

  beforeEach(() => {
    window.innerWidth = 1440;
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    useEditorStore.getState().reset();
  });

  afterEach(() => {
    window.innerWidth = originalWidth;
    window.IntersectionObserver = originalObserver;
  });

  it('기타의 식사 메뉴를 누르면 디자인 여덟 가지를 보고 원하는 디자인의 블록을 추가할 수 있다', () => {
    render(<AddPageButton />);
    const addPage = screen.getByRole('button', { name: '+페이지 추가' });
    fireEvent.click(addPage);
    fireEvent.change(screen.getByPlaceholderText('블록 검색'), {
      target: { value: '셰프' },
    });

    const otherCategory = screen
      .getByRole('heading', { name: '기타' })
      .closest('[data-type]') as HTMLElement;
    fireEvent.click(
      within(otherCategory).getByRole('button', { name: '식사 메뉴' })
    );
    const picker = within(
      screen.getByRole('dialog', { name: '식사 메뉴 디자인 선택' })
    );
    expect(picker.getAllByRole('button', { name: / 선택$/ })).toHaveLength(8);
    expect(picker.getByRole('button', { name: '클래식 선택' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(useEditorStore.getState().block).toHaveLength(0);

    fireEvent.click(picker.getByRole('button', { name: '아르데코 선택' }));
    fireEvent.click(picker.getByRole('button', { name: '식사 메뉴 추가' }));

    const { block, selectedId } = useEditorStore.getState();
    expect(block).toHaveLength(1);
    expect(block[0]).toMatchObject({
      id: selectedId,
      type: 'etc',
      component: 'mealMenu',
      props: { menuStyle: 'artDeco' },
    });
    expect(addPage).toHaveAttribute('aria-expanded', 'false');
  });

  it('요리와 코스를 옮긴 뒤 디자인을 바꿔도 서빙 순서가 저장되어 공유 화면에 표시된다', async () => {
    useEditorStore
      .getState()
      .addBlock('etc', 'mealMenu', 'menu', { menuStyle: 'tasting' });
    const { unmount } = render(<MenuEditor />);
    fireEvent.click(screen.getAllByRole('button', { name: '+ 요리 추가' })[0]);
    fireEvent.change(screen.getAllByLabelText('요리 이름')[1], {
      target: { value: '한입 요리' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: '코스 1 요리 2 위로 이동' })
    );
    fireEvent.click(screen.getByRole('button', { name: '코스 2 위로 이동' }));
    fireEvent.change(screen.getByLabelText('디자인'), {
      target: { value: 'garden' },
    });

    const expectedOrder = [
      '안심 스테이크',
      '한입 요리',
      '구운 단호박 수프',
      '바닐라 판나코타',
    ];
    expect(
      screen.getAllByRole('listitem').map(item => item.firstChild?.textContent)
    ).toEqual(expectedOrder);

    unmount();
    const {
      block,
      titleData,
      bodyData,
      isZoom,
      backgroundColor,
      scrollAnimation,
    } =
      useEditorStore.getState();
    const guestBlock = normalizeGuestBlock(
      JSON.parse(JSON.stringify(block[0])),
      0
    );
    expect(guestBlock.ok).toBe(true);
    if (!guestBlock.ok) throw new Error('공개 메뉴 블록을 읽을 수 없습니다.');
    await act(async () => {
      render(
        <GuestRenderer
          blocks={[guestBlock.block]}
          bulkData={{
            titleData,
            bodyData,
            isZoom,
            backgroundColor,
            scrollAnimation,
          }}
        />
      );
    });

    expect(screen.getByRole('article', { name: '식사 메뉴' })).toHaveAttribute(
      'data-menu-style',
      'garden'
    );
    expect(
      screen.getAllByRole('listitem').map(item => item.firstChild?.textContent)
    ).toEqual(expectedOrder);
  });

  it('추가한 테두리 장식을 편집 화면에서 끌 수 있다', () => {
    useEditorStore
      .getState()
      .addBlock('etc', 'mealMenu', 'menu', { menuStyle: 'ivy' });
    render(<MenuEditor />);
    const ornament = screen.getByRole('checkbox', { name: '테두리 장식' });
    const preview = screen.getByRole('article', { name: '식사 메뉴' });

    expect(preview).toHaveAttribute('data-corner-art', 'true');
    fireEvent.click(ornament);

    expect(preview).toHaveAttribute('data-corner-art', 'false');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it.each(['classic', 'garden', 'ivy', 'ribbon', 'artDeco'])(
    '장식이 꺼져 있어도 %s 디자인을 선택하면 테두리 장식이 켜진다',
    menuStyle => {
      useEditorStore.getState().addBlock('etc', 'mealMenu', 'menu', {
        menuStyle: 'ribbon',
        showCornerArt: false,
      });
      render(<MenuEditor />);
      const design = screen.getByRole('combobox', { name: '디자인' });
      const artwork = screen.getByRole('checkbox', { name: '테두리 장식' });
      const preview = screen.getByRole('article', { name: '식사 메뉴' });
      expect(design).toHaveDisplayValue('리본과 별 (장식 없음)');
      expect(artwork).not.toBeChecked();

      fireEvent.change(design, { target: { value: menuStyle } });
      expect(artwork).toBeChecked();
      expect(preview).toHaveAttribute('data-menu-style', menuStyle);
      expect(preview).toHaveAttribute('data-corner-art', 'true');

      fireEvent.click(artwork);
      expect(preview).toHaveAttribute('data-corner-art', 'false');
      expect(preview).toHaveAttribute('data-menu-style', menuStyle);
      fireEvent.change(design, { target: { value: 'minimal' } });
      expect(
        screen.queryByRole('checkbox', { name: '테두리 장식' })
      ).not.toBeInTheDocument();
      expect(preview).toHaveAttribute('data-corner-art', 'false');
    }
  );
});
