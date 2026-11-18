import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import Edit from '@/widgets/editor/leftPanel/components/Edit';

import Preview from './Preview';

jest.mock('@/widgets/mainPoster/components/MainPosterPreview', () => ({
  MainPosterPreview: () => null,
}));
jest.mock('@/widgets/mainPoster/components/MainPoster', () => ({
  MainPoster: () => <div>포스터 편집 패널</div>,
}));
jest.mock('@/components/organisms/bgm/components/EditorBgmOverlay', () => ({
  EditorBgmOverlay: () => null,
}));
jest.mock('@/components/molecules/editor-callout', () => ({
  EditorCallout: () => null,
}));
jest.mock('@/shared/assets/icons/callout.svg', () => () => null);

describe('미리보기 블록 클릭 선택', () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
    useEditorStore.getState().reset();
  });

  const addDemoBlocks = () => {
    const state = useEditorStore.getState();
    state.addBlock('etc', 'divider', 'divider');
    state.addBlock('etc', 'mealMenu', 'menu', {
      collectionStyle: 'showcase-0',
    });
    state.selectedBlock('divider');
    state.setIsEdit(true);
  };

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('빈 미리보기에서 키보드로 포스터를 선택하면 왼쪽에 포스터 편집 패널이 열린다', async () => {
    const user = userEvent.setup();
    useEditorStore.getState().setIsEdit(true);
    render(
      <>
        <Edit />
        <Preview />
      </>
    );
    expect(screen.getByText('가운데에서 포스터를 선택해 주세요')).toBeVisible();
    const choosePoster = screen.getByRole('button', {
      name: '포스터 선택하기',
    });

    await user.tab();
    expect(choosePoster).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.getByText('포스터 편집 패널')).toBeVisible();
    expect(choosePoster).not.toBeInTheDocument();
    expect(useEditorStore.getState()).toMatchObject({
      selectedId: 'mainPoster',
      isEdit: false,
      isDirty: false,
    });
  });

  it('페이지가 있는 미리보기에서는 포스터 선택 안내를 표시하지 않는다', () => {
    useEditorStore.getState().addBlock('etc', 'divider', 'divider');
    render(
      <>
        <Edit />
        <Preview />
      </>
    );

    expect(screen.getByText('페이지를 추가해주세요')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: '포스터 선택하기' })
    ).toBeNull();
  });

  it('식사 메뉴 본문을 한 번 클릭하면 해당 블록이 선택되고 편집 모드로 전환된다', async () => {
    addDemoBlocks();
    const user = userEvent.setup();
    render(<Preview />);

    await user.click(screen.getByText('구운 단호박 수프'));

    expect(
      screen.queryByRole('button', { name: '식사 메뉴 순서 변경' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '세로 구분선 순서 변경' })
    ).not.toBeInTheDocument();
    expect(useEditorStore.getState()).toMatchObject({
      selectedId: 'menu',
      isEdit: false,
    });
  });

  it('디자인 바깥 여백을 클릭해도 해당 블록이 선택된다', async () => {
    addDemoBlocks();
    const user = userEvent.setup();
    render(<Preview />);
    const chapter = screen
      .getByRole('article', { name: '식사 메뉴' })
      .closest('section[data-component="mealMenu"]');
    if (!(chapter instanceof HTMLElement))
      throw new Error('메뉴 디자인 영역이 없습니다.');

    await user.click(chapter);

    expect(
      screen.queryByRole('button', { name: '식사 메뉴 순서 변경' })
    ).toBeInTheDocument();
    expect(useEditorStore.getState()).toMatchObject({
      selectedId: 'menu',
      isEdit: false,
    });
  });
});
