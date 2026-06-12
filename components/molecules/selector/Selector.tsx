import { ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  ChangeEvent,
  useId,
  CSSProperties,
  ReactNode,
} from 'react';

import { Input } from '@/components/atoms/input';
import CheckIcon from '@/shared/assets/icons/check.svg';
import { cn } from '@/shared/utils/cn';

import {
  selectorVariants,
  selectorStyles,
  SelectorVariantType,
  popoverVariants,
} from './Selector.style';

interface Option {
  label: string | ReactNode;
  value: string;
  style?: CSSProperties;
}

interface SelectorProps<T extends Option> {
  type?: 'normal' | 'editor';
  variant?: SelectorVariantType;
  options: T[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  openTriggerClassName?: string;
  triggerButtonClassName?: string;
  labelClassName?: string;
  optionContainerClassName?: string;
  optionLabelClassName?: string;
  customInputClassName?: string;
  onInputChange?: (value: string) => void;
  onSelect: (option: T) => void;
  selected: T | null;
  showCheckbox?: boolean;
  addPopWidth?: number;
  searchable?: boolean;
  disabled?: boolean;
}

const VIEWPORT_GAP = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

export const Selector = <T extends Option>({
  type = 'editor',
  variant,
  options,
  placeholder = '선택',
  className,
  triggerClassName,
  openTriggerClassName,
  triggerButtonClassName,
  labelClassName,
  optionContainerClassName,
  optionLabelClassName,
  customInputClassName,
  onSelect,
  onInputChange,
  selected,
  showCheckbox = true,
  addPopWidth = 0,
  searchable = false,
  disabled = false,
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
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('type') === 'admin';

  // 실제 값이 있는지 확인 (객체 내부의 value나 label 체크)
  const hasValue = !!(selected?.value || selected?.label);

  const updatePopoverPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    const rect = container.getBoundingClientRect();
    const width = rect.width + addPopWidth;
    const popoverHeight = popoverRef.current?.offsetHeight ?? 0;
    const maxLeft = window.innerWidth - width - VIEWPORT_GAP;
    const left = clamp(rect.left, VIEWPORT_GAP, maxLeft);
    const belowTop = rect.bottom;
    const aboveTop = rect.top - popoverHeight;
    const maxTop = window.innerHeight - popoverHeight - VIEWPORT_GAP;
    const preferredTop =
      popoverHeight > 0 &&
      belowTop + popoverHeight > window.innerHeight - VIEWPORT_GAP &&
      aboveTop >= VIEWPORT_GAP
        ? aboveTop
        : belowTop;

    setPopoverPos({
      top: clamp(preferredTop, VIEWPORT_GAP, maxTop),
      left,
      width: rect.width,
    });
  }, [addPopWidth]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(e.target.value);
  };

  const handleSelect = (option: T) => {
    if (disabled) return;

    setIsCustomInput(false);
    onSelect(option);
    popoverRef.current?.hidePopover();
  };

  const handleToggle = () => {
    if (disabled) return;

    if (isOpen) {
      setIsOpen(false);
      popoverRef.current?.hidePopover();
    } else {
      setIsOpen(true);
      updatePopoverPosition();
      popoverRef.current?.showPopover();
      window.requestAnimationFrame(updatePopoverPosition);
    }
  };

  const handleCustomMenuItemClick = () => {
    setIsCustomInput(true);
    popoverRef.current?.hidePopover();
    onSelect({ label: '', value: '' } as T);
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
  }, [updatePopoverPosition]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;

    updatePopoverPosition();
    const animationFrameId = window.requestAnimationFrame(
      updatePopoverPosition
    );

    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);

    const resizeObserver = new ResizeObserver(updatePopoverPosition);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (popoverRef.current) resizeObserver.observe(popoverRef.current);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
      resizeObserver.disconnect();
    };
  }, [isOpen, updatePopoverPosition]);

  const filteredOptions =
    searchable || isAdmin
      ? options.filter(opt => {
          const labelStr =
            typeof opt.label === 'string' ? opt.label : String(opt.label);
          return labelStr.toLowerCase().includes(searchTerm.toLowerCase());
        })
      : options;

  const variantStyles = variant ? selectorStyles[variant] : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative text-center',
        variantStyles?.container,
        className
      )}
    >
      <div
        className={cn(
          selectorVariants({ type, isOpen, hasValue }),
          variantStyles?.trigger,
          triggerClassName,
          disabled && 'pointer-events-none opacity-60',
          isOpen &&
            (variantStyles && 'openTrigger' in variantStyles
              ? variantStyles.openTrigger
              : openTriggerClassName),
          isOpen && 'border-b-bg-base'
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
              'flex items-center justify-between w-full py-1 pl-2 text-left cursor-pointer',
              variantStyles?.triggerButton,
              triggerButtonClassName,
              disabled && 'cursor-not-allowed'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            disabled={disabled}
          >
            <span
              className={cn(
                'h-6 text-text-primary truncate flex-1 min-w-0 flex items-center justify-center',
                variantStyles?.label,
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
          popoverVariants({ type }),
          selected ? 'bg-bg-base' : 'bg-border-neutral',
          optionContainerClassName
        )}
        style={{
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          width: `${popoverPos.width + addPopWidth}px`,
          inset: 'auto', // popover 기본값 오버라이드
        }}
      >
        {(searchable || isAdmin) && (
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
              'flex w-full items-center min-h-8 gap-1 text-sm text-text-primary cursor-pointer hover:bg-bg-sub transition-colors select-none',
              showCheckbox ? 'pr-1' : 'px-3'
            )}
            role="option"
            aria-selected={selected?.value === option.value}
          >
            {showCheckbox && (
              <div
                className={cn(
                  'flex-center w-6 pl-2 shrink-0 text-primary',
                  selected?.value !== option.value && 'invisible'
                )}
              >
                <CheckIcon width={12} height={12} />
              </div>
            )}
            <span
              className={cn(
                'h-7 leading-7 truncate min-w-0 flex-center',
                variantStyles?.optionLabel,
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
            className="h-7 leading-7 px-1 py-0.5 text-[13px] hover:bg-bg-sub cursor-pointer select-none"
          >
            직접입력
          </li>
        )}
      </ul>
    </div>
  );
};
