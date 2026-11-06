export const rsvpSchema = {
  type: null,
  fields: {
    title: { default: '참석 여부 안내', required: true },
    description: { default: '참석 가능 여부를 알려주시면 준비에 큰 도움이 됩니다.', required: true },
    formUrl: { default: '', required: true },
    buttonText: { default: '참석 여부 응답하기', required: true },
  },
} as const;
