import {
  boundedMotionNumber,
  MOTION_EASINGS,
  resolveMotionEasing,
} from './motionSettings';

type InvitationOpening = 'direct' | 'envelope';

export const AMBIENT_EFFECT_OPTIONS = [
  { value: 'none', label: '없음' },
  { value: 'petals', label: '벚꽃 날림' },
  { value: 'snow', label: '눈 내림' },
  { value: 'confetti', label: '종이 컨페티' },
  { value: 'bokeh', label: '빛망울' },
] as const;

export type AmbientEffect = (typeof AMBIENT_EFFECT_OPTIONS)[number]['value'];
export type AmbientScope = 'poster' | 'screen';

export type InvitationEffectsSettings = {
  opening?: InvitationOpening;
  confetti?: boolean;
  ambientEffect?: AmbientEffect | 'blocks';
  ambientScope?: AmbientScope;
};

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
  const { opening, confetti, ambientEffect, ambientScope } = value as Record<
    string,
    unknown
  >;
  const validOpening = opening === 'direct' || opening === 'envelope';
  const validConfetti = typeof confetti === 'boolean';
  const preset = AMBIENT_EFFECT_OPTIONS.find(
    item => item.value === ambientEffect
  );
  const validScope = ambientScope === 'poster' || ambientScope === 'screen';
  const selection = ambientEffect === 'blocks' ? 'blocks' : preset?.value;
  if (!validOpening && !validConfetti && !selection && !validScope)
    return undefined;
  return {
    ...(validOpening && { opening }),
    ...(validConfetti && { confetti }),
    ...(selection && { ambientEffect: selection }),
    ...(validScope && { ambientScope }),
  };
}

export function resolveBlockAmbientEffect(
  settings: InvitationEffectsSettings | undefined,
  effect: string
) {
  if (settings?.ambientEffect === 'blocks') return effect;
  if (settings?.ambientEffect !== undefined) return settings.ambientEffect;
  // Older invitations used the opening switch to override a confetti block.
  return effect === 'confetti' && settings?.confetti !== undefined
    ? 'none'
    : effect;
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
  const opening = settings?.opening ?? (legacyOpening ? 'envelope' : 'direct');
  const preset = settings?.ambientEffect;
  const useBlocks = preset === undefined || preset === 'blocks';
  const ambient = AMBIENT_EFFECT_OPTIONS.flatMap(({ value: effect }) => {
    if (effect === 'none') return [];
    const source = legacyBlocks.find(block => block.effect === effect);
    const enabled = useBlocks
      ? source && resolveBlockAmbientEffect(settings, effect) === effect
      : preset === effect;
    return enabled
      ? [{ effect, ...resolveEffectMotion(source ?? legacyBlocks[0]) }]
      : [];
  });
  const ambientScope: AmbientScope =
    settings?.ambientScope ??
    (useBlocks && ambient.length ? 'screen' : 'poster');
  return {
    opening,
    confetti: settings?.confetti ?? false,
    openingMotion: resolveEffectMotion(legacyOpening ?? legacyBlocks[0]),
    confettiMotion: resolveEffectMotion(
      legacyBlocks.find(block => block.effect === 'confetti')
    ),
    ambientScope,
    ambient,
  };
}

export type ResolvedInvitationEffects = ReturnType<
  typeof resolveInvitationEffects
>;
