export const countdownSchema = {
  type: null,
  fields: {
    title: { default: '우리의 특별한 날', required: true },
    eventDateTime: { default: '', required: true },
    onDayMessage: { default: '오늘은 특별한 날입니다!', required: true },
    afterMessage: { default: '함께해 주셔서 감사합니다.', required: true },
  },
} as const;
