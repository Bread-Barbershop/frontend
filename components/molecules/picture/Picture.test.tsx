import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { applySquareCrop, mockCropBrowser } from './test-utils/cropControls';
import { Picture } from './Picture';

jest.mock('@/shared/assets/icons/add.svg', () => () => null);
jest.mock('@/shared/assets/icons/cancel.svg', () => () => null);
jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => () => null);

describe('일반 사진 자르기', () => {
  it.each([
    ['1:1', '오른쪽 위', 0, 0, 900, 900],
    ['자유', '오른쪽', 180, 120, 720, 960],
  ] as const)(
    '%s에서 %s 위치를 고르면 그 좌표의 사진을 저장한다',
    async (ratio, position, x, y, width, height) => {
      const drawImage = mockCropBrowser();
      const onChange = jest.fn();
      render(
        <Picture label="사진" value={['/photo.jpg']} onChange={onChange} />
      );
      fireEvent.click(screen.getByRole('button', { name: '자르기' }));
      const image = screen.getByAltText('자를 사진');
      Object.defineProperties(image, {
        naturalWidth: { value: 900 },
        naturalHeight: { value: 1200 },
      });
      fireEvent.load(image);
      fireEvent.click(screen.getByRole('button', { name: ratio }));
      fireEvent.click(screen.getByRole('button', { name: position }));
      fireEvent.click(screen.getByRole('button', { name: '자르기 적용' }));
      await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
      expect(drawImage).toHaveBeenCalledWith(
        image,
        expect.closeTo(x),
        expect.closeTo(y),
        expect.closeTo(width),
        expect.closeTo(height),
        0,
        0,
        width,
        height
      );
    }
  );

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('같은 사진이 두 장이어도 선택한 자리만 교체한다', async () => {
    const onChange = jest.fn();
    const onUpdateFiles = jest.fn();
    const drawImage = mockCropBrowser();
    render(
      <Picture
        multiple
        label="갤러리"
        value={['/photo.jpg', '/photo.jpg', '/last.jpg']}
        onChange={onChange}
        onUpdateFiles={onUpdateFiles}
      />
    );
    fireEvent.click(screen.getAllByRole('button', { name: '자르기' })[1]);
    const dialog = within(screen.getByRole('dialog', { name: '사진 자르기' }));
    expect(dialog.queryByRole('button', { name: '배경으로 적용' })).toBeNull();
    const image = applySquareCrop();
    expect(drawImage).toHaveBeenCalledWith(
      image,
      expect.closeTo(200),
      0,
      expect.closeTo(800),
      800,
      0,
      0,
      800,
      800
    );
    await waitFor(() =>
      expect(onUpdateFiles).toHaveBeenCalledWith([
        '/photo.jpg',
        expect.any(File),
        '/last.jpg',
      ])
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('단일 사진 자르기를 취소하면 저장된 사진을 유지한다', () => {
    const onChange = jest.fn();
    mockCropBrowser();
    render(
      <Picture label="프로필" value={['/photo.jpg']} onChange={onChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: '자르기' }));
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
  it('파일 변환에 실패하면 원본을 유지하고 다시 적용할 수 있다', async () => {
    mockCropBrowser();
    jest
      .mocked(HTMLCanvasElement.prototype.toBlob)
      .mockImplementationOnce(callback => callback(null));
    const onChange = jest.fn();
    render(
      <Picture label="사진" value={['/original.jpg']} onChange={onChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: '자르기' }));
    applySquareCrop();
    expect(await screen.findByRole('alert')).toHaveTextContent('다시 시도');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '자르기 적용' }));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([expect.any(File)])
    );
  });
});
