export interface PhotoStoryPage {
  id: string;
  image: (File | string)[];
  date: string;
  heading: string;
  caption: string;
}

export function createPhotoStoryPage(): PhotoStoryPage {
  return {
    id: crypto.randomUUID(),
    image: [],
    date: '',
    heading: '',
    caption: '',
  };
}

export function readPhotoStoryPages(value: unknown): PhotoStoryPage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((page): PhotoStoryPage[] => {
    if (!page || typeof page.id !== 'string' || !page.id) return [];
    const photo = Array.isArray(page.image) ? page.image[0] : undefined;
    const hasPhoto =
      typeof photo === 'string' ||
      (typeof File !== 'undefined' && photo instanceof File);
    return [
      {
        id: page.id,
        image: hasPhoto ? [photo] : [],
        date: typeof page.date === 'string' ? page.date : '',
        heading: typeof page.heading === 'string' ? page.heading : '',
        caption: typeof page.caption === 'string' ? page.caption : '',
      },
    ];
  });
}

export function hasPhotoStoryPageContent(page: PhotoStoryPage) {
  return Boolean(
    page.image[0] ||
    page.date.trim() ||
    page.heading.trim() ||
    page.caption.trim()
  );
}

export const photoStorySchema = {
  type: null,
  fields: {
    title: { default: '한 장 이야기', required: true },
    pages: { default: () => [createPhotoStoryPage()], required: true },
  },
} as const;
