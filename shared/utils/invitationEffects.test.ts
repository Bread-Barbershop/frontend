import {
  normalizeInvitationEffects,
  resolveInvitationEffects,
} from './invitationEffects';

describe('초대장 배경 효과 복원', () => {
  const blocks = ['petals', 'confetti', 'petals'].map(effect => ({
    component: 'visualEffects',
    props: { effect, effectSpeed: 0.5 },
  }));

  it('예전 블록의 조합과 속도, 전체 화면 범위를 복원한다', () => {
    const effects = resolveInvitationEffects(undefined, blocks);
    expect(effects.ambient.map(({ effect, speed }) => [effect, speed])).toEqual(
      [
        ['petals', 0.5],
        ['confetti', 0.5],
      ]
    );
    expect(effects.ambientScope).toBe('screen');
    expect(effects.confetti).toBe(false);
  });

  it('배경 효과 없음을 명시하면 기존 입자만 끄고 오프닝 설정을 유지한다', () => {
    const effects = resolveInvitationEffects(
      { ambientEffect: 'none', opening: 'envelope', confetti: true },
      blocks
    );
    expect(effects).toMatchObject({
      ambient: [],
      opening: 'envelope',
      confetti: true,
    });
  });

  it('알 수 없는 저장값은 버리고 유효한 개별 설정을 보존한다', () => {
    expect(
      normalizeInvitationEffects({
        ambientEffect: 'typo',
        ambientScope: 'poster',
      })
    ).toEqual({ ambientScope: 'poster' });
    expect(
      normalizeInvitationEffects({
        ambientEffect: 'snow',
        ambientScope: 'typo',
      })
    ).toEqual({ ambientEffect: 'snow' });
    expect(normalizeInvitationEffects({ ambientScope: 123 })).toBeUndefined();
  });
});
