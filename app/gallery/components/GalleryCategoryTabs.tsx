'use client';

import { useState } from 'react';

const CATEGORIES = ['전체', '결혼식', '생일', '세미나', '돌잔치'] as const;
const CATEGORY_BUTTON_SHADOW =
  '0 8px 24px 0 rgb(0 0 0 / 6%), 0 2px 10px 0 rgb(0 0 0 / 8%)';

function GalleryCategoryTabs() {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>('전체');

  return (
    <div className="flex flex-wrap justify-start gap-3">
      {CATEGORIES.map(category => {
        const selected = category === selectedCategory;

        return (
          <button
            key={category}
            type="button"
            className={`h-12 cursor-pointer rounded-full px-8 text-[20px] font-semibold transition-colors ${
              selected
                ? 'bg-black text-white'
                : 'bg-white text-text-plain hover:bg-[#FAFAFB]'
            }`}
            style={{ boxShadow: CATEGORY_BUTTON_SHADOW }}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export default GalleryCategoryTabs;
