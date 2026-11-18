export const visualEffectsSchema = {
  type: null,
  fields: {
    title: { default: '배경 효과', required: true },
    effect: { default: 'none', required: true },
    effectSpeed: { default: 1, required: true },
    motionEasing: { default: 'natural', required: true },
    showEnvelopeIntro: { default: false, required: true },
  },
} as const;
