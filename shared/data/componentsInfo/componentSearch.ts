import type { SampleDataType } from './componentInfo';

const normalizeSearchValue = (value: string) =>
  value.toLocaleLowerCase().replace(/\s+/g, '');

export function filterComponentCategories(
  categories: SampleDataType[],
  searchQuery: string
): SampleDataType[] {
  const terms = searchQuery.trim().split(/\s+/).map(normalizeSearchValue).filter(Boolean);
  if (terms.length === 0) return categories;

  return categories
    .map(category => ({
      ...category,
      list: category.list.filter(item => {
        const searchable = [category.korea, category.english, item.contents, ...(item.aliases ?? [])]
          .map(normalizeSearchValue);
        return terms.every(term => searchable.some(value => value.includes(term)));
      }),
    }))
    .filter(category => category.list.length > 0);
}
