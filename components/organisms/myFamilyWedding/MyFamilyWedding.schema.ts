export const myFamilyWeddingSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: false,
    },
    brideFamily: {
      default: [] as {
        id: string;
        relation: string;
        name: string;
        flower: boolean;
      }[],
      required: false,
    },
    groomFamily: {
      default: [] as {
        id: string;
        relation: string;
        name: string;
        flower: boolean;
      }[],
      required: false,
    },
  },
} as const;
