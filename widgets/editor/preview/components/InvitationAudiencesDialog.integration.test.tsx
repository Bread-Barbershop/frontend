import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Canvas, Rect } from 'fabric';

import { useSavedData } from '@/app/editor/[id]/hooks/useSavedData';
import { useEditorDirtyTracker } from '@/app/editor/hooks/useEditorDirtyTracker';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import type { AudienceGroup } from '@/features/invitation/audiences/model';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { MainPosterPreview } from '@/widgets/mainPoster/components/MainPosterPreview';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import {
  basicAudience,
  familyAudience,
  friendsAudience,
  rootGuestUrl,
  savedBasicInvitation,
} from './fixtures/invitationAudiences';
import InvitationSettingsButton from './AdditionalFeaturesButton';
import InvitationAudiencesButton from './InvitationAudiencesButton';
import InvitationAudiencesDialog from './InvitationAudiencesDialog';

const realFetch = global.fetch;
const mockFetch = jest.fn();
const save = jest.fn();
const close = jest.fn();
const openEditor = jest.fn();

jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => () => null);
jest.mock('@/widgets/mainPoster/hooks/useTemplate', () => ({
  ...jest.requireActual('@/widgets/mainPoster/hooks/useTemplate'),
  preloadFonts: jest.fn().mockResolvedValue(undefined),
}));

function reply(payload: object, ok = true) {
  return { ok, json: async () => payload };
}

function mockList(groups: AudienceGroup[], activeSlug = '') {
  mockFetch.mockResolvedValueOnce(reply({ rootGuestUrl, groups, activeSlug }));
}

function Dialog({ showSettings = false }: { showSettings?: boolean }) {
  useEditorDirtyTracker(true);
  if (showSettings) return <InvitationSettingsButton />;
  return (
    <InvitationAudiencesDialog
      upload={{
        handleUpload: save,
        isLoading: false,
        isCleaningUp: false,
        loadingMessage: '저장하고 있어요.',
      }}
      onClose={close}
      onOpenEditor={openEditor}
    />
  );
}

describe('하객별 구분', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });

  beforeEach(() => {
    mockFetch.mockReset();
    save.mockReset();
    close.mockReset();
    openEditor.mockReset();
    global.fetch = mockFetch;
    useEditorStore.getState().reset();
    useBgmStore.getState().reset();
    useEditorStore.setState({ invitationFolderId: basicAudience.folderId });
  });

  afterEach(() => {
    global.fetch = realFetch;
    jest.restoreAllMocks();
  });

  it('공유 주소는 복사 버튼으로 제공하고 화면에는 입력한 그룹의 쿼리만 안내한다', async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, 'writeText');
    const guestPath = '/guest/root-data';
    mockFetch.mockResolvedValueOnce(
      reply({
        rootGuestUrl: guestPath,
        groups: [basicAudience],
        activeSlug: '',
      })
    );
    render(<Dialog />);

    const copy = await screen.findByRole('button', { name: '기본 링크 복사' });
    expect(
      screen.getByRole('button', { name: '기본 편집 중' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('dialog')).not.toHaveTextContent(guestPath);
    expect(copy).toHaveTextContent('링크 복사');
    const example = screen.getByLabelText('그룹 링크 안내');
    expect(example).toHaveTextContent('기본 링크 뒤에 ?to=family가 붙어요.');
    expect(
      screen.queryByRole('combobox', { name: '복제할 초대장' })
    ).not.toBeInTheDocument();
    await user.click(copy);
    expect(writeText).toHaveBeenCalledWith(`http://localhost${guestPath}`);

    const slug = screen.getByLabelText('링크 영문명');
    await user.type(slug, 'coworkers');
    expect(example).toHaveTextContent('기본 링크 뒤에 ?to=coworkers가 붙어요.');
    await user.type(slug, '@');
    expect(screen.queryByLabelText('그룹 링크 안내')).not.toBeInTheDocument();
    await user.clear(slug);
    expect(screen.getByLabelText('그룹 링크 안내')).toHaveTextContent(
      '?to=family'
    );
  });

  it('하객용 편집기에 직접 들어오면 기존 데이터 요청으로 편집 중인 그룹명을 표시한다', async () => {
    mockFetch.mockResolvedValueOnce(
      reply({
        audienceName: familyAudience.name,
        config: { blocks: [], bgm: {} },
        images: {},
        audios: {},
      })
    );

    function ActiveAudienceToolbar() {
      const { savedData } = useSavedData(
        familyAudience.folderId,
        familyAudience.invitationUuid
      );
      return (
        <InvitationAudiencesButton
          upload={{
            handleUpload: save,
            isLoading: false,
            isCleaningUp: false,
            loadingMessage: '',
          }}
          audienceName={savedData?.audienceName}
        />
      );
    }

    render(<ActiveAudienceToolbar />);

    expect(await screen.findByText('가족 편집 중')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe(
      `/api/drive/updateInvitation?id=${familyAudience.folderId}&uuid=${familyAudience.invitationUuid}`
    );
  });

  it('선택한 그룹을 원본으로 추가하고 새 초대장의 편집기를 연다', async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, 'writeText');
    mockList([basicAudience, familyAudience]);
    mockFetch.mockResolvedValueOnce(
      reply({ group: friendsAudience, rootGuestUrl })
    );
    render(<Dialog />);

    const source = await screen.findByRole('combobox', {
      name: '복제할 초대장',
    });
    await user.selectOptions(source, familyAudience.folderId);
    expect(screen.getByRole('button', { name: '가족' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '가족 링크 복사' }));
    expect(writeText).toHaveBeenCalledWith(
      'http://localhost/i/abc123?to=family'
    );
    await user.type(screen.getByLabelText('대상 이름'), ' 친구 ');
    await user.type(screen.getByLabelText('링크 영문명'), ' friends ');
    await user.click(screen.getByRole('button', { name: '추가' }));

    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toBe('/api/drive/invitationAudiences');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      folderId: basicAudience.folderId,
      sourceFolderId: familyAudience.folderId,
      name: friendsAudience.name,
      slug: friendsAudience.slug,
      requestId: expect.any(String),
    });
    expect(openEditor).toHaveBeenCalledWith(friendsAudience);
  });

  it('이미 등록된 이름이나 링크 영문명은 추가 요청을 보내기 전에 알린다', async () => {
    const user = userEvent.setup();
    mockList([basicAudience, familyAudience]);
    render(<Dialog />);

    const name = await screen.findByLabelText('대상 이름');
    const slug = screen.getByLabelText('링크 영문명');
    const add = screen.getByRole('button', { name: '추가' });
    await user.type(name, familyAudience.name);
    await user.type(slug, familyAudience.slug);
    await user.click(add);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '이미 사용 중인 대상 이름이에요.'
    );
    expect(name).toHaveFocus();

    await user.clear(name);
    await user.type(name, friendsAudience.name);
    await user.click(add);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '이미 사용 중인 링크 영문명이에요.'
    );
    expect(slug).toHaveFocus();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(openEditor).not.toHaveBeenCalled();
  });

  it('추가 중 중복 제출을 막고 일시 오류가 나면 같은 요청 ID로 다시 시도한다', async () => {
    const user = userEvent.setup();
    mockList([basicAudience]);
    let failRequest!: () => void;
    mockFetch
      .mockReturnValueOnce(
        new Promise(resolve => {
          failRequest = () =>
            resolve(reply({ message: '잠시 후 다시 시도해 주세요.' }, false));
        })
      )
      .mockResolvedValueOnce(reply({ group: familyAudience, rootGuestUrl }));
    render(<Dialog />);

    await user.type(
      await screen.findByLabelText('대상 이름'),
      familyAudience.name
    );
    await user.type(screen.getByLabelText('링크 영문명'), familyAudience.slug);
    const form = screen.getByRole('form', { name: '새 하객 그룹' });
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    await act(async () => failRequest());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '잠시 후 다시 시도해 주세요.'
    );
    await user.click(screen.getByRole('button', { name: '추가' }));

    expect(mockFetch.mock.calls[2][1].body).toBe(
      mockFetch.mock.calls[1][1].body
    );
    expect(openEditor).toHaveBeenCalledWith(familyAudience);
  });

  it('새 초대장을 명시적으로 저장한 뒤 현재 편집기에서 그룹 목록을 연다', async () => {
    const user = userEvent.setup();
    useEditorStore.setState({ invitationFolderId: '', isDirty: true });
    save.mockResolvedValueOnce(null).mockImplementationOnce(async () => {
      useEditorStore.setState({
        invitationFolderId: basicAudience.folderId,
        isDirty: false,
      });
      return savedBasicInvitation;
    });
    mockList([basicAudience]);
    render(<Dialog />);

    expect(mockFetch).not.toHaveBeenCalled();
    const saveButton = screen.getByRole('button', { name: '저장 후 계속' });
    await user.click(saveButton);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '현재 초대장을 저장하지 못했어요.'
    );
    expect(mockFetch).not.toHaveBeenCalled();
    await user.click(saveButton);

    expect(
      await screen.findByRole('button', { name: '기본 링크 복사' })
    ).toBeInTheDocument();
    expect(save).toHaveBeenCalledWith({ preserveVisibility: false });
    expect(openEditor).not.toHaveBeenCalled();
  });

  it('저장된 가족 포스터를 열고 기본을 선택하면 저장 확인 없이 바로 전환한다', async () => {
    const user = userEvent.setup();
    const restoreObjects = jest.spyOn(Canvas.prototype, 'add');
    mockList([basicAudience, familyAudience], familyAudience.slug);
    useEditorStore.setState({ invitationFolderId: familyAudience.folderId });
    render(
      <FabricProvider
        initialData={JSON.stringify({
          objects: [{ type: 'Rect', width: 10, height: 10 }],
        })}
      >
        <MainPosterPreview />
        <Dialog />
      </FabricProvider>
    );

    expect(
      screen.getByText('저장된 포스터를 불러오는 중...')
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText('저장된 포스터를 불러오는 중...')
      ).not.toBeInTheDocument()
    );
    expect(restoreObjects).toHaveBeenCalledWith(expect.any(Rect));
    await user.click(
      await screen.findByRole('button', {
        name: /^기본(?:\s|$)/,
        pressed: false,
      })
    );
    expect(save).not.toHaveBeenCalled();
    expect(openEditor).toHaveBeenCalledWith(basicAudience);
  });

  it.each([
    ['다른 수정이 없으면 바로 전환한다', false],
    ['이전에 편집한 내용이 있으면 저장 확인을 표시한다', true],
  ] as const)('설정을 확인만 한 후 그룹을 열 때 %s', async (_, editBgm) => {
    const user = userEvent.setup();
    mockList([basicAudience, familyAudience]);
    useEditorStore.getState().addBlock('wedding', 'calendar', 'date', {
      date: '2027-05-15',
    });
    const view = render(<Dialog showSettings />);
    if (editBgm) act(() => useBgmStore.getState().setVolume(0.35));
    await user.click(screen.getByRole('button', { name: '초대장 설정' }));
    await user.click(screen.getByRole('button', { name: '적용' }));
    expect(useEditorStore.getState().invitationPrivacy).toBeUndefined();

    view.rerender(<Dialog />);
    await user.click(
      await screen.findByRole('button', {
        name: familyAudience.name,
        exact: true,
      })
    );
    if (editBgm) {
      expect(
        screen.getByRole('button', { name: '저장 후 계속' })
      ).toBeVisible();
      expect(openEditor).not.toHaveBeenCalled();
    } else {
      expect(openEditor).toHaveBeenCalledWith(familyAudience);
    }
    expect(save).not.toHaveBeenCalled();
  });

  it('BGM만 편집한 경우에도 저장 확인을 거치고 성공하기 전에는 전환하지 않는다', async () => {
    const user = userEvent.setup();
    mockList([basicAudience, familyAudience], familyAudience.slug);
    useEditorStore.setState({ invitationFolderId: familyAudience.folderId });
    save
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(savedBasicInvitation);
    render(<Dialog />);

    const target = await screen.findByRole('button', {
      name: '기본',
    });
    act(() => useBgmStore.getState().setVolume(0.35));
    expect(useEditorStore.getState().isDirty).toBe(true);
    await user.click(target);
    expect(save).not.toHaveBeenCalled();
    expect(openEditor).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(target).toBeEnabled();
    expect(openEditor).not.toHaveBeenCalled();

    await user.click(target);
    const saveButton = screen.getByRole('button', { name: '저장 후 계속' });
    await user.click(saveButton);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '현재 초대장을 저장하지 못했어요.'
    );
    expect(openEditor).not.toHaveBeenCalled();
    await user.click(saveButton);

    await waitFor(() => expect(openEditor).toHaveBeenCalledWith(basicAudience));
    expect(save).toHaveBeenCalledWith({ preserveVisibility: true });
  });
});
