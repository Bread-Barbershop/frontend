export const DEFAULT_FAMILY_SUFFIX = {
  groom: '의 아들',
  bride: '의 딸',
} as const;

export const myFamilyWeddingSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: false,
    },
    groomFamilySuffix: {
      default: DEFAULT_FAMILY_SUFFIX.groom,
      required: false,
    },
    brideFamilySuffix: {
      default: DEFAULT_FAMILY_SUFFIX.bride,
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
