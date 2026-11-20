import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FabricImage } from 'fabric';

import { mockCropBrowser } from '@/components/molecules/picture/test-utils/cropControls';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { PosterPhotoCropDialog } from './PosterPhotoCropDialog';

import type { Canvas } from 'fabric';

jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricContext: jest.fn(),
}));

function openCrop() {
  const drawImage = mockCropBrowser();
  jest.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue({
    drawImage,
    clearRect: jest.fn(),
  } as unknown as CanvasRenderingContext2D);
  const photo = new Image(1200, 800);
  photo.src = '/photo.jpg';
  const target = new FabricImage(photo, { left: 80, top: 50 });
  const background = new FabricImage(photo);
  const canvas = {
    width: 300,
    height: 600,
    contains: () => true,
    setActiveObject: jest.fn(),
    requestRenderAll: jest.fn(),
    remove: jest.fn(),
  };
  const actions = {
    setCropTarget: jest.fn(),
    setBackgroundImage: jest.fn().mockResolvedValue(background),
    runHistoryTransaction: jest.fn(async (change: () => Promise<void>) =>
      change()
    ),
  };
  jest
    .mocked(useFabricContext)
    .mockReturnValue(actions as unknown as ReturnType<typeof useFabricContext>);
  render(
    <PosterPhotoCropDialog
      canvas={canvas as unknown as Canvas}
      target={target}
    />
  );
  const image = screen.getByAltText('자를 사진');
  Object.defineProperties(image, {
    naturalWidth: { value: 1200 },
    naturalHeight: { value: 800 },
  });
  fireEvent.load(image);
  fireEvent.click(screen.getByRole('button', { name: '1:1' }));
  return { drawImage, image, target, canvas, actions, background };
}

describe('포스터 사진 자르기', () => {
  afterEach(() => jest.restoreAllMocks());

  it('정사각형 선택 영역에서 세로 표지에 보이는 부분을 미리 보고 같은 좌표를 배경에 적용한다', async () => {
    const { drawImage, image, target, canvas, actions, background } =
      openCrop();
    const x = expect.closeTo(400);
    expect(drawImage).toHaveBeenLastCalledWith(
      image,
      x,
      0,
      400,
      800,
      0,
      0,
      160,
      320
    );
    fireEvent.click(screen.getByRole('button', { name: '배경으로 적용' }));
    await waitFor(() =>
      expect(actions.setCropTarget).toHaveBeenCalledWith(null)
    );
    expect(actions.setBackgroundImage).toHaveBeenCalledWith(target.getSrc(), {
      saveHistory: false,
      crop: { unit: 'px', x, y: 0, width: 400, height: 800 },
      opacity: 1,
    });
    expect(canvas.remove).toHaveBeenCalledWith(target);
    expect(canvas.setActiveObject).toHaveBeenCalledWith(background);
    expect(actions.runHistoryTransaction).toHaveBeenCalledTimes(1);
  });

  it('자르기만 적용하면 원래 사진이 같은 위치에서 정사각형이 된다', async () => {
    const { target, actions } = openCrop();
    const center = target.getCenterPoint();
    fireEvent.click(screen.getByRole('button', { name: '자르기만 적용' }));
    await waitFor(() =>
      expect(actions.setCropTarget).toHaveBeenCalledWith(null)
    );
    expect(target.width).toBeCloseTo(800);
    expect(target.height).toBeCloseTo(800);
    expect(target.cropX).toBeCloseTo(200);
    expect(target.getCenterPoint()).toEqual(center);
    expect(actions.setBackgroundImage).not.toHaveBeenCalled();
  });

  it('배경 적용 실패 후 취소하면 원본 사진을 유지한다', async () => {
    const { canvas, actions, target } = openCrop();
    actions.setBackgroundImage.mockResolvedValueOnce(null);
    fireEvent.click(screen.getByRole('button', { name: '배경으로 적용' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('다시 시도');
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(actions.setCropTarget).toHaveBeenCalledWith(null);
    expect(canvas.remove).not.toHaveBeenCalled();
    expect(target.width).toBe(1200);
  });
});
