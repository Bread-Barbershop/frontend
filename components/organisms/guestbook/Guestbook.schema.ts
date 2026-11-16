export const guestbookSchema = {
  type: null,
  fields: {
    title: { default: '축하 메시지 남기기', required: true },
    description: { default: '소중한 축하 메시지를 남겨주세요.', required: true },
    formUrl: { default: '', required: true },
    buttonText: { default: '축하 메시지 작성하기', required: true },
  },
} as const;
