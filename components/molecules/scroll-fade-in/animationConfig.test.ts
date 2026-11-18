import { resolveScrollAnimation } from './animationConfig';

describe('resolveScrollAnimation', () => {
  it('defaults to the current animation for legacy data', () => {
    expect(resolveScrollAnimation({})).toEqual({
      animationType: 'fade-up',
      triggerMode: 'down-only',
      animationDurationMs: 700,
      animationEasing: 'natural',
    });
  });
  it('allows configured presets and ignores unknown values', () => {
    expect(
      resolveScrollAnimation({ animationType: 'zoom-in', triggerMode: 'both' })
    ).toMatchObject({ animationType: 'zoom-in', triggerMode: 'both' });
    expect(
      resolveScrollAnimation({
        animationType: 'alert(1)',
        triggerMode: 'invalid',
      })
    ).toMatchObject({ animationType: 'fade-up', triggerMode: 'down-only' });
  });
  it('기존 상향 전용 설정은 양방향 반복으로 복원한다', () => {
    expect(resolveScrollAnimation({ triggerMode: 'up-only' }).triggerMode).toBe(
      'both'
    );
  });
  it('저장된 전환 시간과 부드러움을 복원하고 잘못된 값은 제한한다', () => {
    expect(
      resolveScrollAnimation({
        animationDurationMs: 1400,
        animationEasing: 'soft',
      })
    ).toMatchObject({ animationDurationMs: 1400, animationEasing: 'soft' });
    expect(resolveScrollAnimation({ animationDurationMs: 5 })).toHaveProperty(
      'animationDurationMs',
      200
    );
    expect(
      resolveScrollAnimation({ animationDurationMs: 9999 })
    ).toHaveProperty('animationDurationMs', 2000);
    expect(
      resolveScrollAnimation({
        animationDurationMs: NaN,
        animationEasing: 'url(evil)',
      })
    ).toMatchObject({ animationDurationMs: 700, animationEasing: 'natural' });
  });
});
