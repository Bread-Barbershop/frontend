import { Search, X } from 'lucide-react';

import { UtilityButton } from '@/components/atoms/button';
import { componentCls } from '@/shared/data/componentsInfo/componentInfo';

interface Props {
  active: string;
  tabClick: (english: string) => void;
  closeClick: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

function TabArea({
  active,
  tabClick,
  closeClick,
  searchQuery = '',
  onSearchChange,
}: Props) {
  return (
    <div className="flex justify-between items-center px-5">
      <ul className="flex">
        {componentCls.map((items, index) => (
          <li
            key={index}
            className={`w-19 h-11 cursor-pointer select-none flex-center font-semibold text-sm ${active === items.english ? 'text-text-primary border-b' : 'text-text-secondary border-0'}`}
            onClick={() => tabClick(items.english)}
          >
            {items.korea}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 text-neutral-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            placeholder="컴포넌트 검색"
            className="h-8 w-40 rounded-md border border-neutral-200 bg-neutral-50 pl-8 pr-7 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:bg-white focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2 flex size-4 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <UtilityButton
          variant={'danger'}
          className="font-semibold text-sm"
          onClick={closeClick}
        >
          닫기
        </UtilityButton>
      </div>
    </div>
  );
}

export default TabArea;
