'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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

  const selectCategory = (category: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (category === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-wrap justify-start gap-3">
      {CATEGORIES.map(category => {
        const selected = category.value === selectedCategory;

        return (
          <button
            key={category.value}
            type="button"
            className={`h-12 cursor-pointer rounded-full px-8 text-[20px] font-semibold transition-colors ${
              selected
                ? 'bg-black text-white'
                : 'bg-white text-text-plain hover:bg-[#FAFAFB]'
            }`}
            style={{ boxShadow: CATEGORY_BUTTON_SHADOW }}
            onClick={() => selectCategory(category.value)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

export default GalleryCategoryTabs;
