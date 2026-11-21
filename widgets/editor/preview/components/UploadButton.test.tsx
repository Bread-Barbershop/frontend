import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import business from '@/public/templates/json/seminar_01.v1.json';
import classic from '@/public/templates/json/wedding_10.v1.json';

import UploadButton from './UploadButton';

const mockConfirm = jest.fn();
const mockGetObjects = jest.fn();
jest.mock('@/shared/hooks/useConfirm', () => ({
  useConfirm: () => ({ confirm: mockConfirm }),
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricViewContext: () => ({ canvas: { getObjects: mockGetObjects } }),
}));
jest.mock('./SaveModal', () => ({ SaveModal: () => null }));

const upload = {
  handleUpload: jest.fn(),
  isLoading: false,
  isFail: false,
  isCleaningUp: false,
  pendingInvitation: null,
  loadingMessage: '',
};

beforeEach(() => jest.clearAllMocks());

it.each([
  ['클래식 모먼트', classic],
  ['볼드 비즈니스', business],
] as const)(
  '%s 표지의 실제 예시가 남으면 저장 전에 확인하고 취소할 수 있다',
  async (_, template) => {
    mockGetObjects.mockReturnValue(template.objects);
    mockConfirm.mockResolvedValue(false);
    render(<UploadButton upload={upload} />);
    fireEvent.click(screen.getByRole('button', { name: '모두 저장하기' }));
    await waitFor(() =>
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('표지에 예시 문구가 남아 있어요'),
          confirmText: '그대로 저장',
          cancelText: '돌아가기',
        })
      )
    );
    expect(upload.handleUpload).not.toHaveBeenCalled();
  }
);

it('편집한 문구와 장식 제목만 있으면 일반 확인 후 저장한다', async () => {
  mockGetObjects.mockReturnValue([
    { text: 'WEDDING DAY' },
    { text: '고관우 · 라니' },
    { text: '2027-05-22' },
  ]);
  mockConfirm.mockResolvedValue(true);
  render(<UploadButton upload={upload} />);
  fireEvent.click(screen.getByRole('button', { name: '모두 저장하기' }));
  await waitFor(() => expect(upload.handleUpload).toHaveBeenCalledTimes(1));
  expect(mockConfirm.mock.calls[0][0].message).not.toContain('예시 문구');
});

it('일부만 수정해도 남은 예시를 표시하고 그대로 저장을 허용한다', async () => {
  mockGetObjects.mockReturnValue([
    { text: '고관우 · 라니' },
    { text: '8TH AUGUST 2026' },
    { text: 'Speaker by Andrew Jackson', visible: false },
    { text: 'MINSUNG PARK', isOnScreen: () => false },
  ]);
  mockConfirm.mockResolvedValue(true);
  render(<UploadButton upload={upload} />);
  fireEvent.click(screen.getByRole('button', { name: '모두 저장하기' }));
  await waitFor(() => expect(upload.handleUpload).toHaveBeenCalledTimes(1));
  const { message } = mockConfirm.mock.calls[0][0];
  expect(message).toContain('8TH AUGUST 2026');
  expect(message).not.toMatch(/Andrew|MINSUNG|고관우/);
});
