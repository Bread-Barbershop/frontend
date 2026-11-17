jest.mock('next/navigation', () => ({ usePathname: () => '/editor' }));
jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: jest.requireActual('./fixtures/recovery').editorTestStore,
}));
jest.mock('@/components/organisms/bgm/store/useBgmStore', () => ({
  useBgmStore: jest.requireActual('./fixtures/recovery').bgmTestStore,
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricContext: () =>
    jest.requireActual('./fixtures/recovery').fabricFixture,
}));
jest.mock('./localDraftStore', () => ({
  readLocalDraft: jest.fn(),
  writeLocalDraft: jest.fn(async () => true),
  deleteLocalDraft: jest.fn(),
}));

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { markCanvasInitialized } from '@/widgets/mainPoster/utils/canvasReadiness';

import { packDraft } from './draftSerialization';
import {
  bgmTestStore,
  canvasFixture,
  editorTestStore,
  recoveredEditor,
} from './fixtures/recovery';
import LocalDraftRecovery from './LocalDraftRecovery';
import { deleteLocalDraft, readLocalDraft } from './localDraftStore';

describe('편집기 초안 복구', () => {
  const originalFetch = global.fetch;
  beforeEach(async () => {
    jest.clearAllMocks();
    editorTestStore.setState({
      ...recoveredEditor,
      invitationUuid: 'current-uuid',
    });
    bgmTestStore.getState().reset();
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ isLoggedIn: true, userId: 'account-a' }),
    })) as jest.Mock;
    const payload = await packDraft({
      editor: recoveredEditor,
      bgm: {
        ...bgmTestStore.getState(),
        userFile: new File(['music'], 'music.mp3', { type: 'audio/mpeg' }),
        userFileName: 'music.mp3',
      },
      poster: { objects: [] },
    });
    jest
      .mocked(readLocalDraft)
      .mockResolvedValue({
        epoch: 0,
        draft: {
          id: 'account-a:/editor',
          owner: 'account-a',
          path: '/editor',
          modifiedAt: Date.now(),
          payload,
        },
      });
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });
  it('포스터 초기화가 끝난 뒤 복구를 제안하고 음악과 편집 상태를 복원한다', async () => {
    render(<LocalDraftRecovery />);
    // Actual MainPosterPreview signals readiness after its asynchronous JSON/font load.
    act(() => markCanvasInitialized(canvasFixture));
    fireEvent.click(
      await screen.findByRole('button', { name: '이어서 작성하기' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(editorTestStore.getState().invitationUuid).toBe('recovered-uuid');
    expect(bgmTestStore.getState().userFile?.name).toBe('music.mp3');
    expect(canvasFixture.loadFromJSON).toHaveBeenCalledWith({ objects: [] });
  });
  it('새로 시작하기를 선택하면 현재 편집 상태를 유지하고 이전 초안을 삭제한다', async () => {
    render(<LocalDraftRecovery />);
    act(() => markCanvasInitialized(canvasFixture));
    fireEvent.click(
      await screen.findByRole('button', { name: '새로 시작하기' })
    );
    await waitFor(() =>
      expect(deleteLocalDraft).toHaveBeenCalledWith('account-a', '/editor')
    );
    expect(editorTestStore.getState().invitationUuid).toBe('current-uuid');
    expect(canvasFixture.loadFromJSON).not.toHaveBeenCalled();
  });
});
