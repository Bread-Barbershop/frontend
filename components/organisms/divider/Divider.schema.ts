export const dividerSchema = {
  type: null,
  fields: {
    height: { default: 64, required: true },
    thickness: { default: 1, required: true },
    color: { default: '#E2E8F0', required: true },
    topSpacing: { default: 12, required: true },
    bottomSpacing: { default: 12, required: true },
  },
} as const;
