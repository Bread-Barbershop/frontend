export const transportationSchema = {
  type: null,
  fields: {
    title: { default: '오시는 길 안내', required: true },
    subwayLine: { default: '', required: true },
    subwayStation: { default: '', required: true },
    subwayExit: { default: '', required: true },
    subwayWalk: { default: '', required: true },
    busRoutes: { default: '', required: true },
    shuttleStop: { default: '', required: true },
    shuttleInterval: { default: '', required: true },
    parkingHours: { default: '', required: true },
    alternativeParking: { default: '', required: true },
    navigationUrl: { default: '', required: true },
  },
} as const;
