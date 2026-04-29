import { PhoneGroup } from './utils/phone.types';

export const phoneSchema = {
  type: null,
  fields: {
    groups: {
      default: [] as PhoneGroup[],
      required: true,
    },
  },
} as const;
