export const TEMPLATE_CATEGORIES = {
  all: '전체',
  wedding: '결혼식',
  birthday: '생일',
  seminar: '세미나',
  firstBirthday: '돌잔치',
} as const;

export type TemplateCategory = keyof typeof TEMPLATE_CATEGORIES;

export interface TemplateItem {
  id: string;
  name: string;
  category: TemplateCategory;
  version: number;
  thumbnailUrl: string;
  jsonUrl: string;
}

export interface TemplateManifest {
  templates: TemplateItem[];
}
