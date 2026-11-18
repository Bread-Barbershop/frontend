import { resolvePictureTransform } from './pictureTransform';

describe('resolvePictureTransform', () => {
  it('preserves legacy picture defaults', () => {
    expect(resolvePictureTransform({})).toEqual({
      aspectRatio: '1/1',
      transform: 'rotate(0deg) scale(1)',
      objectPosition: '50% 50%',
      filter: 'brightness(100%)',
    });
  });
  it('bounds untrusted transform values and rejects arbitrary filters', () => {
    expect(resolvePictureTransform({
      imageScale: 100, imageOffsetX: -8, imageRotation: Infinity,
      imageRatio: '999', imageFilter: 'url(javascript:alert(1))',
    })).toEqual({
      aspectRatio: '1/1',
      transform: 'rotate(0deg) scale(3)',
      objectPosition: '0% 50%',
      filter: 'brightness(100%)',
    });
  });
});
