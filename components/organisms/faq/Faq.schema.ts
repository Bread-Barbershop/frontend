export type FaqItem = { question: string; answer: string };

export const faqSchema = {
  type: null,
  fields: {
    title: { default: '자주 묻는 질문', required: true },
    items: {
      default: () => [
        { question: '식사는 언제부터 가능한가요?', answer: '' },
        { question: '주차는 어떻게 등록하나요?', answer: '' },
        { question: '아이와 함께 방문해도 되나요?', answer: '' },
      ] as FaqItem[],
      required: true,
    },
  },
} as const;
