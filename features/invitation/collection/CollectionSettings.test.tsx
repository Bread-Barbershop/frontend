import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CollectionSettings from './CollectionSettings';
jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: () => 'saved-folder',
}));

it('초대장 설정을 열거나 항목을 고른 것만으로는 연결 정보를 보관하지 않는다', async () => {
  const original = global.fetch;
  const response = (data: unknown) =>
    ({ ok: true, json: async () => data }) as Response;
  const api = jest.fn(async () =>
    response({ guestbook: false, photos: false, eventDate: '' })
  );
  global.fetch = api;
  try {
    render(<CollectionSettings suggestedDate="2099-01-03" />);
    fireEvent.click(await screen.findByLabelText('공개 방명록 받기'));
    expect(screen.getByText(/2099년 1월 6일/)).toBeInTheDocument();
    expect(screen.getByText(/로그아웃한 동안에도/)).toBeInTheDocument();
    expect(api).toHaveBeenCalledTimes(1);
    fireEvent.click(
      screen.getByRole('button', { name: '동의하고 접수 설정 저장' })
    );
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '접수 설정을 저장했어요'
      )
    );
    expect(api).toHaveBeenLastCalledWith(
      '/api/guest-collection/settings',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          guestbook: true,
          photos: false,
          eventDate: '2099-01-03',
          folder: 'saved-folder',
          consent: true,
        }),
      })
    );
  } finally {
    global.fetch = original;
  }
});
