import { ChevronDown, Check } from 'lucide-react';
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';

import { cn } from '@/shared/utils/cn';

interface Option {
  label: string | React.ReactNode;
  value: string;
}

interface SelectorProps<T> {
  options: T[];
  placeholder?: string;
  className?: string;
  onInputChange?: (value: string) => void;
  onSelect: (option: T | { label: string; value: string }) => void;
  selected: T | { label: string; value: string } | null;
  /** 옵션 목록에서 체크박스(체크 아이콘) 표시 여부 */
  showCheckbox?: boolean;
}

export const Selector = <T extends Option>({
  options,
  placeholder = '선택',
  className,
  onSelect,
  onInputChange,
  selected,
  showCheckbox = true,
}: SelectorProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 실제 값이 있는지 확인 (객체 내부의 value나 label 체크)
  const hasValue = !!(selected?.value || selected?.label);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(e.target.value);
    onSelect({ label: e.target.value, value: e.target.value });
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
    onSelect({ label: '', value: '' });
  };

  const currentSelectedValue = selected?.value;
  const isOptionValue = options.some(opt => opt.value === currentSelectedValue);

  if (isCustomInput && currentSelectedValue && isOptionValue) {
    setIsCustomInput(false);
  }

  useEffect(() => {
    if (isCustomInput) {
      inputRef.current?.focus();
    }
  }, [isCustomInput]);

  // 바깥 영역 클릭 시 닫기
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
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center justify-between w-full text-sm transition-all overflow-hidden',
          hasValue || isCustomInput ? 'bg-bg-base' : 'bg-border-neutral',
          isOpen ? 'rounded-t-lg border-b-transparent' : 'rounded-lg'
        )}
      >
        {isCustomInput ? (
          <input
            ref={inputRef}
            type="text"
            className="w-full h-9 px-2 bg-transparent outline-none text-text-primary text-sm"
            value={typeof selected?.label === 'string' ? selected.label : ''}
            onChange={handleInputChange}
            onBlur={() => {
              if (!selected?.label) setIsCustomInput(false);
            }}
          />
        ) : (
          <button
            onClick={handleToggle}
            className={cn(
              'flex items-center justify-between w-full py-1 pl-2 text-left cursor-pointer'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="h-7 leading-7 text-center text-text-primary truncate flex-1 flex-center min-w-0">
              {hasValue ? selected?.label : placeholder}
            </span>

            <div
              className={cn(
                'flex-center size-7 transition-transform duration-200 shrink-0',
                isOpen && 'rotate-180'
              )}
            >
              <ChevronDown size={12} />
            </div>
          </button>
        )}
      </div>
      {isOpen && (
        <ul
          className={cn(
            'absolute z-10 top-full left-0 w-full rounded-b-lg overflow-y-auto max-h-72 textarea-custom-scrollbar shadow-lg',
            selected ? 'bg-bg-base' : 'bg-border-neutral'
          )}
        >
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={cn(
                'flex items-center py-1 text-sm text-text-primary cursor-pointer hover:bg-bg-sub transition-colors',
                showCheckbox ? 'pr-2' : 'px-2'
              )}
              role="option"
              aria-selected={selected?.value === option.value}
            >
              {showCheckbox && (
                <div
                  className={cn(
                    'flex-center w-7 shrink-0 text-primary',
                    selected?.value !== option.value && 'invisible'
                  )}
                >
                  <Check size={12} />
                </div>
              )}
              <span className="h-7 leading-7 text-center flex-1 truncate min-w-0 flex-center">
                {option.label}
              </span>
            </li>
          ))}

          {onInputChange && (
            <li
              onClick={handleCustomMenuItemClick}
              className="h-7 leading-7 px-2 py-0.5 text-center text-sm hover:bg-bg-sub cursor-pointer"
            >
              직접 입력
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
