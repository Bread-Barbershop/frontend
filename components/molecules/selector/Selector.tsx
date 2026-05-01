import { ChevronDown, Check } from 'lucide-react';
import React, { useState, useRef, useEffect, ChangeEvent, useId } from 'react';

import { cn } from '@/shared/utils/cn';

import { selectorVariants } from './Selector.style';

interface Option {
  label: string | React.ReactNode;
  value: string;
}

interface SelectorProps<T> {
  type?: 'normal' | 'editor';
  options: T[];
  placeholder?: string;
  className?: string;
  customInputClassName?: string;
  onInputChange?: (value: string) => void;
  onSelect: (option: T | { label: string; value: string }) => void;
  selected: T | { label: string; value: string } | null;
  showCheckbox?: boolean;
  addPopWidth?: number;
}

export const Selector = <T extends Option>({
  type = 'editor',
  options,
  placeholder = '선택',
  className,
  customInputClassName,
  onSelect,
  onInputChange,
  selected,
  showCheckbox = true,
  addPopWidth = 0,
}: SelectorProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const popoverId = `popover-${baseId}`;

  // 실제 값이 있는지 확인 (객체 내부의 value나 label 체크)
  const hasValue = !!(selected?.value || selected?.label);

  const updatePopoverPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(e.target.value);
  };

  const handleSelect = (option: T) => {
    setIsCustomInput(false);
    onSelect(option);
    popoverRef.current?.hidePopover();
  };

  const handleToggle = () => {
    if (isOpen) {
      popoverRef.current?.hidePopover();
    } else {
      updatePopoverPosition();
      popoverRef.current?.showPopover();
    }
  };

  const handleCustomMenuItemClick = () => {
    setIsCustomInput(true);
    popoverRef.current?.hidePopover();
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

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const handleToggleEvent = (e: Event) => {
      const toggleEvent = e as ToggleEvent;
      setIsOpen(toggleEvent.newState === 'open');
      if (toggleEvent.newState === 'open') updatePopoverPosition();
    };

    el.addEventListener('toggle', handleToggleEvent);
    return () => el.removeEventListener('toggle', handleToggleEvent);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className={cn(selectorVariants({ type, isOpen, hasValue }))}>
        {isCustomInput ? (
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'w-full h-9 px-2 bg-transparent outline-none text-text-primary text-sm',
              customInputClassName
            )}
            value={typeof selected?.value === 'string' ? selected.value : ''}
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
            <span className="h-6 text-center text-text-primary truncate flex-1 min-w-0 flex items-center justify-center">
              {hasValue ? selected?.label : placeholder}
            </span>

            <div
              className={cn(
                'flex-center size-6 transition-transform duration-200 shrink-0',
                isOpen && 'rotate-180'
              )}
            >
              <ChevronDown size={12} />
            </div>
          </button>
        )}
      </div>

      <ul
        id={popoverId}
        ref={popoverRef}
        popover="auto"
        className={cn(
          'z-10 rounded-b-lg max-h-72 shadow-lg border-none p-0 m-0 fixed list-none edit-custom-scrollbar',
          selected ? 'bg-bg-base' : 'bg-border-neutral'
        )}
        style={{
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          width: `${popoverPos.width + addPopWidth}px`,
          inset: 'auto', // popover 기본값 오버라이드
        }}
      >
        {options.map(option => (
          <li
            key={option.value}
            onClick={() => handleSelect(option)}
            className={cn(
              'flex w-full items-center py-1 text-sm text-text-primary cursor-pointer hover:bg-bg-sub transition-colors',
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
            className="h-7 leading-7 px-1 py-0.5 text-center text-[13px] hover:bg-bg-sub cursor-pointer"
          >
            직접입력
          </li>
        )}
      </ul>
    </div>
  );
};
