export const dressCodeSchema = {
  type: null,
  fields: {
    title: { default: '드레스 코드', required: true },
    colors: {
      default: () => ['#F1DED9', '#E5E7EB', '#E1EBDD'] as string[],
      required: true,
    },
    guidelines: { default: () => [] as string[], required: true },
  },
} as const;
