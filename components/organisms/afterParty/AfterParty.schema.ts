export const afterPartySchema = {
  type: null,
  fields: {
    title: { default: '피로연 · 애프터파티', required: true },
    description: { default: '', required: true },
    venue: { default: '', required: true },
    address: { default: '', required: true },
    dateTime: { default: '', required: true },
    mapUrl: { default: '', required: true },
    feeInfo: { default: '', required: true },
    attendanceNote: { default: '', required: true },
  },
} as const;
