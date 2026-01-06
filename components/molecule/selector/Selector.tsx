import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { cn } from '@/utils/cn';

interface SelectorProps<T> {
  options: T[];
  placeholder?: string;
  className?: string;
  onSelect: (option: T | { label: string; value: string }) => void;
  selected: T | { label: string; value: string } | null;
}

export const Selector = <T extends { label: string; value: string }>({
  options,
  placeholder = '선택',
  className,
  onSelect,
  selected,
}: SelectorProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 직접 입력 모드로 전환될 때 포커스 처리
  useEffect(() => {
    if (isCustomInput) inputRef.current?.focus();
  }, [isCustomInput]);

  const handleSelect = (option: T) => {
    setIsCustomInput(false);
    onSelect(option);
    setIsOpen(false);
  };

  const handleCustomClick = () => {
    setIsCustomInput(true);
    setIsOpen(false); // 리스트 닫기
  };

  return (
    <div className={cn('relative min-w-[72px]', className)}>
      <div
        className={cn(
          'flex items-center justify-between w-full px-2 py-2 text-sm bg-background-base border transition-all border-neutral-border',
          isOpen ? 'rounded-t-lg border-b-transparent' : 'rounded-lg'
        )}
      >
        {isCustomInput ? (
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent outline-none text-text-primary"
            value={selected?.label || ''}
            onChange={e => onSelect({ label: e.target.value, value: 'custom' })}
            onBlur={() => {
              if (!selected?.label) setIsCustomInput(false);
            }}
          />
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-text-primary truncate">
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                'size-3 ml-2 transition-transform duration-200 shrink-0',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full bg-background-base border border-neutral-border border-t-0 rounded-b-lg overflow-hidden shadow-lg">
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 text-sm text-text-primary cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {option.label}
            </li>
          ))}
          <li
            onClick={handleCustomClick}
            className="px-3 py-2 text-sm text-blue-500 font-medium border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            직접 입력
          </li>
        </ul>
      )}
    </div>
  );
};
