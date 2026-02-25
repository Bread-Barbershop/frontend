export const placeSchema = {
  type: null,
  fields: {
    title: {
      default: '오시는 길',
      required: true,
    },
    placeName: {
      default: '',
      required: true,
    },
    placeDetail: {
      default: '',
      required: true,
    },
    placeAddress: {
      default: '',
      required: true,
    },
    placeTel: {
      default: '',
      required: true,
    },
    openMap: {
      default: false,
      required: true,
    },
    openNavi: {
      default: false,
      required: true,
    },
    lng: {
      default: 0,
      required: true,
    },
    lat: {
      default: 0,
      required: true,
    },
  },
} as const;
