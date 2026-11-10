export const wreathSchema = {
  type: null,
  fields: {
    title: { default: '축하 화환 안내', required: true },
    mode: { default: 'decline', required: true },
    declineMessage: {
      default: '축하 화환은 정중히 사양합니다. 보내주시는 따뜻한 마음만 감사히 받겠습니다.',
      required: true,
    },
    orderMessage: { default: '축하의 마음을 전하실 수 있도록 안내드립니다.', required: true },
    hallName: { default: '', required: true },
    hallAddress: { default: '', required: true },
    eventDate: { default: '', required: true },
    groomName: { default: '', required: true },
    brideName: { default: '', required: true },
    partnerCode: { default: '', required: true },
  },
} as const;
