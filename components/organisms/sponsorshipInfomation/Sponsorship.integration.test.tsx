import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { extractFileGroups } from '@/shared/utils/extractFileGroups';
import { compressImages } from '@/shared/utils/imageCompression';

import Editor from './SposorshipInfomation';
import Preview from './SposorshipInfomationPreview';

jest.mock('@/shared/assets/icons/add.svg', () => () => null);
jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => () => null);
jest.mock('@/shared/utils/imageCompression', () => ({
  compressImages: jest.fn(
    jest.requireActual('@/shared/utils/imageCompression').compressImages
  ),
}));

type SponsorBlock = EditorBlock<'sponsorshipInfomation'>;
const legacy: SponsorBlock = {
  id: 'sponsor-block',
  type: 'seminar',
  component: 'sponsorshipInfomation',
  props: { title: '후원사', images: ['/samples/original.webp'] },
};

function readBlock() {
  return useEditorStore.getState().block[0] as SponsorBlock;
}

function EditorWithGuest() {
  const block = useEditorStore(state => state.block[0]) as SponsorBlock;
  return (
    <>
      <Editor id={block.id} blockInfo={block} />
      <Preview className="" blockInfo={block} isGuestPage />
    </>
  );
}

function sponsorRows() {
  return screen
    .getAllByLabelText('후원사 이름')
    .map(input => within(input.closest('li')!));
}

const file = (name: string) => new File([name], name, { type: 'image/png' });
const originalCreate = URL.createObjectURL,
  originalRevoke = URL.revokeObjectURL;

describe('후원사 편집과 하객 표시', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    URL.createObjectURL = jest.fn(blob => `blob:${(blob as File).name}`);
    URL.revokeObjectURL = jest.fn();
  });
  afterEach(() => {
    cleanup();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    jest.restoreAllMocks();
  });

  it('기존 로고에 이름을 붙이고 이름만 있는 후원사를 추가해 순서를 바꿔도 저장된 짝이 유지된다', async () => {
    const user = userEvent.setup();
    useEditorStore.getState().setBlock([legacy]);
    const editor = render(<EditorWithGuest />);
    expect(
      screen.getByRole('img', { name: '후원사 로고 이미지' })
    ).toBeVisible();

    await user.type(screen.getByLabelText('후원사 이름'), '모아스튜디오');
    await user.click(screen.getByRole('button', { name: /후원사 추가/ }));
    await user.type(screen.getAllByLabelText('후원사 이름')[1], '한빛재단');
    screen.getByRole('button', { name: '한빛재단 순서 변경' }).focus();
    await user.keyboard('{ArrowUp}');
    await user.click(screen.getByRole('button', { name: /후원사 추가/ }));
    expect(readBlock().props.sponsors).toMatchObject([
      { name: '한빛재단', logoIndex: null },
      { name: '모아스튜디오', logoIndex: 0 },
      { name: '', logoIndex: null },
    ]);

    const saved: SponsorBlock = JSON.parse(JSON.stringify(readBlock()));
    editor.unmount();
    useEditorStore.getState().setBlock([saved]);
    render(<EditorWithGuest />);
    const guest = within(screen.getByRole('list', { name: '후원사 목록' }));
    const cards = guest.getAllByRole('listitem');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('한빛재단');
    expect(cards[0].querySelector('img')).toBeNull();
    expect(cards[1]).toHaveTextContent('모아스튜디오');
    expect(cards[1].querySelector('img')).toBeInTheDocument();
  });

  it('여러 로고를 추가하고 한 곳의 로고만 교체·삭제하면 이름과 다른 로고가 유지된다', async () => {
    const user = userEvent.setup();
    useEditorStore.getState().setBlock([legacy]);
    render(<EditorWithGuest />);
    await user.click(screen.getByRole('button', { name: /후원사 추가/ }));
    const names = screen.getAllByLabelText('후원사 이름');
    await user.type(names[1], '한빛재단');
    const input = names[1].closest('li')!.querySelector<HTMLInputElement>('input[type="file"]')!;
    const [first, second, replacement] = ['one.png', 'two.png', 'new.png'].map(
      file
    );
    await user.upload(input, [first, second]);
    expect(readBlock().props.images).toEqual([
      '/samples/original.webp',
      first,
      second,
    ]);
    expect(
      extractFileGroups(
        [readBlock()],
        [{ id: legacy.id, file: 'drive-id' }]
      ).get(legacy.id)?.file
    ).toEqual([first, second]);
    await user.upload(input, replacement);
    expect(useEditorStore.getState().images[0].file).toEqual([
      '/samples/original.webp',
      replacement,
      second,
    ]);
    await user.click(
      sponsorRows()[1].getByRole('button', { name: '로고 삭제' })
    );
    expect(names[1]).toHaveValue('한빛재단');
    expect(readBlock().props.images).toEqual([
      '/samples/original.webp',
      second,
    ]);
    await user.click(
      sponsorRows()[0].getByRole('button', { name: /항목 삭제/ })
    );
    expect(readBlock().props.sponsors).toMatchObject([
      { name: '한빛재단', logoIndex: null },
      { name: '', logoIndex: 0 },
    ]);
  });

  it('로고를 교체한 뒤 이전 파일의 압축이 늦게 끝나도 새 파일이 저장된다', async () => {
    let finish!: () => void;
    jest.mocked(compressImages).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = () => resolve([file('compressed-first.jpg')]);
        })
    );
    const user = userEvent.setup();
    useEditorStore.getState().setBlock([legacy]);
    render(<EditorWithGuest />);
    const input = screen
      .getByLabelText('후원사 이름')
      .closest('li')!
      .querySelector<HTMLInputElement>('input[type="file"]')!;
    const first = file('first.png'),
      latest = file('latest.png');
    await user.upload(input, first);
    expect(useEditorStore.getState().images[0].file).toEqual([first]);
    await user.upload(input, latest);
    await act(async () => finish());
    expect(readBlock().props.images).toEqual([latest]);
    expect(useEditorStore.getState().images[0].file).toEqual([latest]);
  });
});
