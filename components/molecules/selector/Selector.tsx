import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, ChangeEvent } from 'react';

import { cn } from '@/shared/utils/cn';

interface Option {
  label: string;
  value: string;
}

interface SelectorProps<T> {
  options: T[];
  placeholder?: string;
  className?: string;
  onInputChange?: (value: string) => void;
  onSelect: (option: T | { label: string; value: string }) => void;
  selected: T | { label: string; value: string } | null;
}

export const Selector = <T extends Option>({
  options,
  placeholder = '선택',
  className,
  onSelect,
  onInputChange,
  selected,
}: SelectorProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(e.target.value);
    onSelect({ label: e.target.value, value: 'custom' } as T);
  };

  const handleSelect = (option: T) => {
    setIsCustomInput(false);
    onSelect(option);
    setIsOpen(false);
  };

  const handleToggle = () => setIsOpen(!isOpen);

  const handleCustomMenuItemClick = () => {
    setIsCustomInput(true);
    setIsOpen(false);
    onSelect({ label: '', value: 'custom' } as T);
  };

  // 직접 입력 모드로 전환될 때 포커스 처리
  useEffect(() => {
    if (isCustomInput) inputRef.current?.focus();
  }, [isCustomInput]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative min-w-[72px]', className)}>
      <div
        className={cn(
          'flex items-center justify-between w-full px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral',
          isOpen ? 'rounded-t-lg border-b-transparent' : 'rounded-lg'
        )}
      >
        {isCustomInput ? (
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent outline-none text-text-primary"
            value={selected?.label || ''}
            onChange={handleInputChange}
            onBlur={() => {
              if (!selected?.label) setIsCustomInput(false);
            }}
          />
        ) : (
          <button
            onClick={handleToggle}
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
        <ul className="absolute z-10 w-full bg-bg-base border border-border-neutral border-t-0 rounded-b-lg overflow-hidden shadow-lg">
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 text-sm text-text-primary cursor-pointer hover:bg-bg-sub transition-colors"
            >
              {option.label}
            </li>
          ))}
          {/* onInputChange 프롭이 있을 때만 '직접 입력' 항목 표시 */}
          {onInputChange && (
            <li
              onClick={handleCustomMenuItemClick}
              className="px-3 py-2 text-primary font-medium border-t border-border-neutral hover:bg-primary-hover cursor-pointer text-sm"
            >
              직접 입력
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
