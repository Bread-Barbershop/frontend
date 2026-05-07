import { ChevronDown, Check } from 'lucide-react';
import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useId,
  CSSProperties,
  ReactNode,
} from 'react';

import { Input } from '@/components/atoms/input';
import { cn } from '@/shared/utils/cn';

import { selectorVariants } from './Selector.style';

interface Option {
  label: string | ReactNode;
  value: string;
  style?: CSSProperties;
}

interface SelectorProps<T extends Option> {
  type?: 'normal' | 'editor';
  options: T[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
  optionLabelClassName?: string;
  customInputClassName?: string;
  onInputChange?: (value: string) => void;
  onSelect: (option: T | Option) => void;
  selected: T | Option | null;
  showCheckbox?: boolean;
  addPopWidth?: number;
  searchable?: boolean;
}

export const Selector = <T extends Option>({
  type = 'editor',
  options,
  placeholder = '선택',
  className,
  triggerClassName,
  labelClassName,
  optionLabelClassName,
  customInputClassName,
  onSelect,
  onInputChange,
  selected,
  showCheckbox = true,
  addPopWidth = 0,
  searchable = false,
}: SelectorProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      const isOpening = toggleEvent.newState === 'open';
      setIsOpen(isOpening);
      if (isOpening) {
        updatePopoverPosition();
        setSearchTerm('');
      }
    };

    el.addEventListener('toggle', handleToggleEvent);
    return () => el.removeEventListener('toggle', handleToggleEvent);
  }, []);

  const filteredOptions = searchable
    ? options.filter(opt => {
        const labelStr =
          typeof opt.label === 'string' ? opt.label : String(opt.label);
        return labelStr.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : options;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          selectorVariants({ type, isOpen, hasValue }),
          triggerClassName
        )}
      >
        {isCustomInput ? (
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'w-full h-8 px-2 bg-transparent outline-none text-text-primary text-sm',
              customInputClassName
            )}
            value={typeof selected?.value === 'string' ? selected.value : ''}
            onChange={handleInputChange}
            onBlur={() => {
              setIsCustomInput(false);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                setIsCustomInput(false);
              }
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
            <span
              className={cn(
                'h-6 text-center text-text-primary truncate flex-1 min-w-0 flex items-center justify-center',
                labelClassName
              )}
              style={selected?.style}
            >
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
        {searchable && (
          <div className="sticky top-0 z-10 p-1 bg-bg-base border-b border-border-neutral rounded-md">
            <Input
              type="text"
              placeholder="검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-8 px-2 text-xs bg-transparent border border-border-neutral rounded-md outline-none focus:border-primary text-text-primary placeholder:text-text-disabled"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
        {filteredOptions.map(option => (
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
            <span
              className={cn(
                'h-7 leading-7 text-center flex-1 truncate min-w-0 flex-center',
                optionLabelClassName
              )}
              style={option.style}
            >
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
