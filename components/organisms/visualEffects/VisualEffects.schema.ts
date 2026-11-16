export const visualEffectsSchema = {
  type: null,
  fields: {
    title: { default: '배경 효과', required: true },
    effect: { default: 'none', required: true },
    showEnvelopeIntro: { default: false, required: true },
  },
} as const;
