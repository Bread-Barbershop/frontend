import { resolveScrollAnimation } from './animationConfig';

describe('resolveScrollAnimation', () => {
  it('defaults to the current animation for legacy data', () => {
    expect(resolveScrollAnimation({})).toEqual({ animationType: 'fade-up', triggerMode: 'down-only' });
  });
  it('allows configured presets and ignores unknown values', () => {
    expect(resolveScrollAnimation({ animationType: 'zoom-in', triggerMode: 'both' }))
      .toEqual({ animationType: 'zoom-in', triggerMode: 'both' });
    expect(resolveScrollAnimation({ animationType: 'alert(1)', triggerMode: 'invalid' }))
      .toEqual({ animationType: 'fade-up', triggerMode: 'down-only' });
  });
});
