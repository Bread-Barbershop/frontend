/* global jest */
import { fireEvent, screen, within } from '@testing-library/react';

export function mockCropBrowser() {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  const drawImage = jest.fn();
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  jest
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    .mockImplementation(callback => {
      callback(new Blob(['cropped'], { type: 'image/webp' }));
    });
  return drawImage;
}

export function applySquareCrop() {
  const dialog = within(screen.getByRole('dialog', { name: '사진 자르기' }));
  const image = dialog.getByAltText('자를 사진');
  Object.defineProperties(image, {
    naturalWidth: { value: 1200 },
    naturalHeight: { value: 800 },
  });
  fireEvent.load(image);
  fireEvent.click(dialog.getByRole('button', { name: '1:1' }));
  fireEvent.click(dialog.getByRole('button', { name: '자르기 적용' }));
  return image;
}
