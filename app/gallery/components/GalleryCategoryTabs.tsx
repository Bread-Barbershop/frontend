'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { LargePrintFilter } from '@/features/showcase/components/LargePrintFilter';

const CATEGORIES = [
  { label: '전체', value: 'all' },
  { label: '결혼식', value: 'wedding' },
  { label: '생일', value: 'birthday' },
  { label: '세미나', value: 'seminar' },
  { label: '돌잔치', value: 'firstBirthday' },
] as const;

const CATEGORY_BUTTON_SHADOW =
  '0 8px 24px 0 rgb(0 0 0 / 6%), 0 2px 10px 0 rgb(0 0 0 / 8%)';

function GalleryCategoryTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';

  const setFilter = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === null) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap justify-start gap-3">
        {CATEGORIES.map(category => {
          const selected = category.value === selectedCategory;

          return (
            <button
              key={category.value}
              type="button"
              aria-pressed={selected}
              className={`h-12 cursor-pointer rounded-full px-8 text-[20px] font-semibold transition-colors ${
                selected
                  ? 'bg-black text-white'
                  : 'bg-white text-text-plain hover:bg-[#FAFAFB]'
              }`}
              style={{ boxShadow: CATEGORY_BUTTON_SHADOW }}
              onClick={() =>
                setFilter(
                  'category',
                  category.value === 'all' ? null : category.value
                )
              }
            >
              {category.label}
            </button>
          );
        })}
      </div>
      <LargePrintFilter
        checked={searchParams.get('largePrint') === '1'}
        onChange={checked => setFilter('largePrint', checked ? '1' : null)}
      />
    </div>
  );
}

export default GalleryCategoryTabs;
