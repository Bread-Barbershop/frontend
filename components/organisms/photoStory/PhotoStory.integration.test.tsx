import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { compressImage } from '@/shared/utils/imageCompression';

import { PhotoStoryEditor } from './PhotoStoryEditor';
import { PhotoStoryPreview } from './PhotoStoryPreview';

jest.mock('@/shared/assets/icons/add.svg', () => () => null);
jest.mock('@/shared/assets/icons/cancel.svg', () => () => null);
jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => () => null);
jest.mock('@/shared/utils/imageCompression', () => ({
  compressImage: jest.fn(async (file: File) => file),
}));

function EditorWithGuestPreview() {
  const story = useEditorStore(state =>
    state.block.find(
      (item): item is EditorBlock<'photoStory'> =>
        item.component === 'photoStory'
    )
  );
  return (
    story && (
      <>
        <PhotoStoryEditor id={story.id} blockInfo={story} />
        <PhotoStoryPreview blockInfo={story} isGuestPage />
      </>
    )
  );
}

describe('한 장 이야기', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    useEditorStore.getState().addBlock('firstBirthday', 'photoStory', 'story');
    URL.createObjectURL = jest.fn(() => 'blob:story-photo');
    URL.revokeObjectURL = jest.fn();
  });

  it('빈 장은 하객에게 숨기고 순서를 바꿔도 사진·날짜·제목·짧은 글을 한 장으로 유지한다', async () => {
    render(<EditorWithGuestPreview />);
    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('제목'), {
      target: { value: '봄날의 기록' },
    });
    const first = screen.getByRole('group', { name: '1번째 장' });
    fireEvent.change(within(first).getByLabelText('날짜'), {
      target: { value: '2026-04-17' },
    });
    fireEvent.change(within(first).getByLabelText('장 제목'), {
      target: { value: '첫 산책' },
    });
    fireEvent.change(within(first).getByLabelText('짧은 글'), {
      target: { value: '둘이서 걸은 오후.' },
    });
    const file = new File(['spring'], 'spring.webp', { type: 'image/webp' });
    await act(async () => {
      fireEvent.change(first.querySelector('input[type=file]')!, {
        target: { files: [file] },
      });
    });
    fireEvent.click(screen.getByRole('button', { name: '장 추가' }));
    const second = screen.getByRole('group', { name: '2번째 장' });
    fireEvent.change(within(second).getByLabelText('장 제목'), {
      target: { value: '다음 날' },
    });
    fireEvent.click(
      within(second).getByRole('button', { name: '2번째 장 앞으로' })
    );

    const guest = within(screen.getByRole('region', { name: '봄날의 기록' }));
    const [tomorrow, walk] = guest.getAllByRole('figure');
    expect(tomorrow).toHaveTextContent('다음 날');
    expect(walk).toHaveTextContent('2026. 04. 17');
    expect(walk).toHaveTextContent('둘이서 걸은 오후.');
    expect(within(walk).getByRole('img', { name: '첫 산책' })).toHaveAttribute(
      'src',
      'blob:story-photo'
    );
    const [imageGroup] = useEditorStore.getState().images;
    expect(imageGroup.file[0]).toBe(file);
    fireEvent.click(screen.getByRole('button', { name: '2번째 장 삭제' }));
    expect(guest.getAllByRole('figure')).toHaveLength(1);
    expect(
      guest.queryByRole('button', { name: '다음 장' })
    ).not.toBeInTheDocument();
    expect(
      useEditorStore.getState().images.find(group => group.id === imageGroup.id)
        ?.file
    ).toEqual([]);
  });

  it('가로 스크롤 위치에 맞춰 현재 장과 이전·다음 버튼을 갱신한다', () => {
    useEditorStore.getState().updateBlock<'photoStory'>('story', {
      pages: ['처음 잡은 손', '발바닥에 닿은 봄'].map((heading, i) => ({
        id: String(i),
        heading,
        image: [],
        date: '',
        caption: '',
      })),
    });
    render(<EditorWithGuestPreview />);
    const track = screen.getByRole('region', { name: '이야기 페이지' });
    const [first, second] = within(track).getAllByRole('figure');
    Object.defineProperty(second, 'offsetLeft', { value: 310 });

    fireEvent.scroll(track, { target: { scrollLeft: 310 } });
    expect(screen.getByText('2 / 2')).toBeVisible();
    expect(second).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('button', { name: '다음 장' })).toBeDisabled();

    fireEvent.scroll(track, { target: { scrollLeft: 0 } });
    expect(screen.getByText('1 / 2')).toBeVisible();
    expect(first).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('button', { name: '이전 장' })).toBeDisabled();
  });

  it('블록 삭제 후 압축이 끝나도 지운 장의 사진이 저장 대기열에 되살아나지 않는다', async () => {
    let finish!: () => void;
    jest.mocked(compressImage).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = () =>
            resolve(new File(['small'], 'small.jpg', { type: 'image/jpeg' }));
        })
    );
    const { container } = render(<EditorWithGuestPreview />);
    const file = new File(['original'], 'original.jpg', { type: 'image/jpeg' });
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: { files: [file] },
    });
    expect(useEditorStore.getState().images[0].file[0]).toBe(file);
    act(() => useEditorStore.getState().deleteBlock('story'));
    await act(async () => finish());
    expect(useEditorStore.getState().images).toEqual([]);
    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
  });
});
