import { act, fireEvent, render, screen } from '@testing-library/react';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { updateFileToDrive } from '@/features/invitation/save/updateFileToDrive';
import { uploadFileToDrive } from '@/features/invitation/save/uploadFileToDrive';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { getFileKey } from '@/shared/utils/fileUtils';

import { mockBgmSaveApi } from '../hooks/fixtures/bgmSave';
import { useInvitationUpload } from '../hooks/useInvitationUpload';
import UploadButton from './UploadButton';

jest.mock('@/features/invitation/save/uploadFileToDrive');
jest.mock('@/features/invitation/save/updateFileToDrive');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('./SaveLottie', () => ({ SaveLottie: () => null }));
jest.mock('@/shared/hooks/useConfirm', () => ({
  useConfirm: () => ({ confirm: async () => true }),
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricViewContext: () => ({ canvas: { getObjects: () => [] } }),
  useFabricContext: () => ({
    exportIntersectedJSON: () => null,
    exportCanvasPreview: () => null,
  }),
}));

function EditorSaveButton() {
  return <UploadButton upload={useInvitationUpload()} />;
}

const originalFetch = global.fetch;
const tick = (ms: number) => act(() => jest.advanceTimersByTimeAsync(ms));

describe('모두 저장하기 사진 진행률', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    act(() => {
      useEditorStore.getState().reset();
      useBgmStore.getState().reset();
    });
    jest.useRealTimers();
  });

  it('새 사진만 세고 재시도 성공 후 음원 저장 단계로 넘어간다', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(mockBgmSaveApi);
    const cached = new File([], 'saved.jpg');
    const fast = new File([], 'fast.jpg');
    const slow = new File([], 'slow.jpg');
    const retry = new File([], 'retry.jpg');
    const audio = new File([], 'music.mp3');
    const file = ['/images/sample.webp', cached, fast, slow, retry];
    useEditorStore.setState({
      images: [{ id: 'gallery', file }],
      hashFiles: [`${await getFileKey(cached, 'gallery')}::saved-id`],
    });
    useBgmStore.setState({ userFile: audio });
    let failOnce = true;
    const upload = jest
      .mocked(uploadFileToDrive)
      .mockImplementation(async item => {
        await new Promise(resolve =>
          setTimeout(resolve, item === slow ? 3000 : 100)
        );
        if (item === retry && failOnce) {
          failOnce = false;
          throw new Error('Drive upload failed: 503');
        }
        return { fileId: item.name, name: item.name };
      });
    jest
      .mocked(updateFileToDrive)
      .mockResolvedValue({ name: 'data.json', fileId: 'data' });
    render(<EditorSaveButton />);

    fireEvent.click(screen.getByRole('button', { name: '모두 저장하기' }));
    await tick(0);
    const bar = screen.getByRole('progressbar', { name: '사진 업로드' });
    expect(bar).toHaveAttribute('max', '3');
    expect(bar).toHaveAttribute('value', '0');
    await tick(2100);
    expect(screen.getByRole('status')).toHaveTextContent(
      '사진 업로드 중 · 3장 중 1장 완료'
    );
    expect(bar).toHaveAttribute('value', '1');
    await tick(900);
    expect(bar).toHaveAttribute('value', '2');
    expect(upload.mock.calls.map(([item]) => item)).toEqual([
      fast,
      slow,
      retry,
      retry,
    ]);
    await tick(100);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(upload).toHaveBeenLastCalledWith(audio, 'invitation-audio', 'test');
    await tick(100);
    expect(screen.getByText('성공적으로 저장되었습니다!')).toBeInTheDocument();
  });
});
