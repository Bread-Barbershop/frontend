export const bgmSchema = {
  type: null,
  fields: {
    selectedBgmId: {
      default: '',
      required: false,
    },
    isLoop: {
      default: false,
      required: false,
    },
    userBgmTitle: {
      default: '',
      required: false,
    },
    userBgmDuration: {
      default: '00:00',
      required: false,
    },
    userBgmSrc: {
      default: '',
      required: false,
    },
    volume: {
      default: 0.2,
      required: false,
    },
  },
} as const;
