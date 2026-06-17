export type TemplateCategory =
  | 'birthday'
  | 'conference'
  | 'firstBirthday'
  | 'wedding'
  | 'etc';

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
