import {
  boundedMotionNumber,
  MOTION_EASINGS,
  resolveMotionEasing,
} from './motionSettings';

type InvitationOpening = 'direct' | 'envelope';

export type InvitationEffectsSettings = {
  opening?: InvitationOpening;
  confetti?: boolean;
};

const PARTICLE_EFFECTS = ['petals', 'snow', 'confetti', 'bokeh'] as const;

type EffectMotion = {
  speed: number;
  easing: string;
};

type EffectsBlock = {
  component: string;
  props: unknown;
};

type LegacyEffects = {
  effect?: unknown;
  effectSpeed?: unknown;
  motionEasing?: unknown;
  showEnvelopeIntro?: unknown;
};

export function normalizeInvitationEffects(
  value: unknown
): InvitationEffectsSettings | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const { opening, confetti } = value as Record<string, unknown>;
  const validOpening = opening === 'direct' || opening === 'envelope';
  const validConfetti = typeof confetti === 'boolean';
  if (!validOpening && !validConfetti) return undefined;
  return {
    ...(validOpening && { opening }),
    ...(validConfetti && { confetti }),
  };
}

function resolveEffectMotion(props?: LegacyEffects): EffectMotion {
  return {
    speed: boundedMotionNumber(props?.effectSpeed, 0.5, 2, 1),
    easing: MOTION_EASINGS[resolveMotionEasing(props?.motionEasing)],
  };
}

export function resolveInvitationEffects(
  settings: InvitationEffectsSettings | undefined,
  blocks: readonly EffectsBlock[]
) {
  const legacyBlocks = blocks.flatMap(({ component, props }) =>
    component === 'visualEffects' && props && typeof props === 'object'
      ? [props as LegacyEffects]
      : []
  );
  const legacyOpening = legacyBlocks.find(
    block => block.showEnvelopeIntro === true
  );
  const legacyConfetti = legacyBlocks.find(
    block => block.effect === 'confetti'
  );
  const opening = settings?.opening ?? (legacyOpening ? 'envelope' : 'direct');
  const confetti = settings?.confetti ?? Boolean(legacyConfetti);
  const ambient = PARTICLE_EFFECTS.filter(
    effect => effect !== 'confetti'
  ).flatMap(effect => {
    const source = legacyBlocks.find(block => block.effect === effect);
    return source ? [{ effect, ...resolveEffectMotion(source) }] : [];
  });
  return {
    opening,
    confetti,
    openingMotion: resolveEffectMotion(legacyOpening ?? legacyBlocks[0]),
    confettiMotion: resolveEffectMotion(legacyConfetti),
    repeatConfetti: settings?.confetti === undefined && Boolean(legacyConfetti),
    ambient,
  };
}

export type ResolvedInvitationEffects = ReturnType<
  typeof resolveInvitationEffects
>;
