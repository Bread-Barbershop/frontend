import { getBlockEntrance, resolveScrollAnimation } from './animationConfig';

describe('resolveScrollAnimation', () => {
  it('설정되지 않은 효과는 없음으로 표시한다', () => {
    expect(resolveScrollAnimation({})).toEqual({
      animationType: 'none',
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
    ).toMatchObject({ animationType: 'none', triggerMode: 'down-only' });
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

describe('getBlockEntrance', () => {
  it('지원하는 블록에서만 양옆에서 모이기를 복원한다', () => {
    expect(getBlockEntrance('gallery', { entranceEffect: 'paired' })).toBe(
      'paired'
    );
    expect(
      getBlockEntrance('calendar', { entranceEffect: 'paired' })
    ).toBeUndefined();
  });

  it('효과 없음을 보존하고 잘못된 값은 전체 설정을 따르게 한다', () => {
    expect(getBlockEntrance('interview', { entranceEffect: 'none' })).toBe(
      'none'
    );
    expect(
      getBlockEntrance('interview', { entranceEffect: 'unknown' })
    ).toBeUndefined();
    expect(getBlockEntrance('interview', null)).toBeUndefined();
  });
});
