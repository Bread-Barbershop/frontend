type PhoneContact = {
  label: string;
  number: string;
};

export const phoneSchema = {
  type: null,
  fields: {
    contacts: {
      default: [] as PhoneContact[],
      required: true,
    },
  },
} as const;
