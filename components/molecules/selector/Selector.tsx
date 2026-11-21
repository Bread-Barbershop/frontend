import { ChevronDown } from 'lucide-react';
import {
  Fragment,
  useState,
  useRef,
  useEffect,
  useCallback,
  ChangeEvent,
  useId,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from 'react';

import { Input } from '@/components/atoms/input';
import CheckIcon from '@/shared/assets/icons/check.svg';
import { cn } from '@/shared/utils/cn';

import {
  selectorListClass,
  selectorOptionClass,
  selectorTriggerClass,
  selectorWidths,
} from './Selector.style';

interface Option {
  label: string | ReactNode;
  value: string;
  group?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

interface SelectorProps<T extends Option> {
  variant?: keyof typeof selectorWidths;
  options: readonly T[];
  triggerId?: string;
  labelledBy?: string;
  ariaLabel?: string;
  invalid?: boolean;
  describedBy?: string;
  onOptionVisible?: (value: string) => void;
  placeholder?: string;
  className?: string;
  onInputChange?: (value: string) => void;
  onInputBlur?: () => void;
  onSelect: (option: T) => void;
  selected: T | null;
  searchable?: boolean;
  disabled?: boolean;
  stepControls?: {
    onUp: () => void;
    onDown: () => void;
    upDisabled?: boolean;
    downDisabled?: boolean;
  };
}

const VIEWPORT_GAP = 12;
const MAX_LIST_HEIGHT = 288;
const CUSTOM_INPUT_LIST_MIN_WIDTH = 96;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

export const Selector = <T extends Option>({
  variant,
  options,
  triggerId,
  labelledBy,
  ariaLabel,
  invalid,
  describedBy,
  onOptionVisible,
  placeholder = '선택',
  className,
  onSelect,
  onInputChange,
  onInputBlur,
  selected,
  searchable = false,
  disabled = false,
  stepControls,
}: SelectorProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const scrollToActive = useRef(true);
  const [popoverPos, setPopoverPos] = useState({
    offset: 0,
    left: 0,
    width: 0,
    maxHeight: MAX_LIST_HEIGHT,
    above: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const popoverId = `popover-${baseId}`;
  const buttonId = triggerId ?? `selector-${baseId}`;
  const accessibleLabel = ariaLabel ?? (labelledBy ? undefined : placeholder);

  // 실제 값이 있는지 확인 (객체 내부의 value나 label 체크)
  const hasValue = !!(selected?.value || selected?.label);

  const updatePopoverPosition = useCallback(() => {
    const container = containerRef.current;
    const list = popoverRef.current;
    if (!container || !list) return;

    const rect = container.getBoundingClientRect();
    const width = Math.min(
      Math.max(rect.width, onInputChange ? CUSTOM_INPUT_LIST_MIN_WIDTH : 0),
      window.innerWidth - 2 * VIEWPORT_GAP
    );
    const maxLeft = window.innerWidth - width - VIEWPORT_GAP;
    const left = clamp(rect.left, VIEWPORT_GAP, maxLeft);
    const roomBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP;
    const roomAbove = rect.top - VIEWPORT_GAP;
    const listHeight = Math.min(list.scrollHeight + 1, MAX_LIST_HEIGHT);
    const above = roomBelow < listHeight && roomAbove > roomBelow;

    setPopoverPos({
      offset: above ? window.innerHeight - rect.top : rect.bottom,
      left,
      width,
      maxHeight: clamp(above ? roomAbove : roomBelow, 0, MAX_LIST_HEIGHT),
      above,
    });
  }, [onInputChange]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(e.target.value);
  };

  const closePopover = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    popoverRef.current?.hidePopover?.();
  };

  const openPopover = () => {
    scrollToActive.current = true;
    setIsOpen(true);
    popoverRef.current?.showPopover?.();
    updatePopoverPosition();
  };

  const handleSelect = (option: T) => {
    if (disabled || option.disabled) return;

    setIsCustomInput(false);
    closePopover();
    triggerRef.current?.focus({ preventScroll: true });
    onSelect(option);
  };

  const handleToggle = () => {
    if (disabled) return;

    if (isOpen) closePopover();
    else {
      setActiveIndex(
        options.findIndex(
          option => !option.disabled && option.value === selected?.value
        )
      );
      openPopover();
    }
  };

  const handleCustomMenuItemClick = () => {
    if (disabled) return;
    setIsCustomInput(true);
    closePopover();
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
      } else {
        setActiveIndex(-1);
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

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updatePopoverPosition);
    if (containerRef.current) resizeObserver?.observe(containerRef.current);
    if (popoverRef.current) resizeObserver?.observe(popoverRef.current);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
      resizeObserver?.disconnect();
    };
  }, [isOpen, updatePopoverPosition]);

  const filteredOptions = searchable
    ? options.filter(opt => {
        const labelStr =
          typeof opt.label === 'string' ? opt.label : String(opt.label);
        return labelStr.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : options;

  const activeOptionId =
    isOpen && activeIndex !== -1 ? `${popoverId}-${activeIndex}` : undefined;

  useEffect(() => {
    if (activeOptionId && scrollToActive.current) {
      document
        .getElementById(activeOptionId)
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeOptionId]);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!isOpen || !popover || !onOptionVisible) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const row = entry.target as HTMLLIElement;
          if (row.dataset.optionValue) onOptionVisible(row.dataset.optionValue);
          observer.unobserve(row);
        });
      },
      { root: popover }
    );

    popover.querySelectorAll('[data-option-value]').forEach(row => {
      observer.observe(row);
    });
    return () => observer.disconnect();
  }, [isOpen, onOptionVisible, options, searchTerm]);

  const handleStepKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!stepControls || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown'))
      return;
    const isUp = event.key === 'ArrowUp';
    event.preventDefault();
    event.stopPropagation();
    if (
      disabled ||
      (isUp ? stepControls.upDisabled : stepControls.downDisabled)
    )
      return;
    (isUp ? stepControls.onUp : stepControls.onDown)();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;
    if (disabled || event.nativeEvent.isComposing) return;
    if (!isOpen && stepControls && (key === 'ArrowUp' || key === 'ArrowDown')) {
      handleStepKeyDown(event);
      return;
    }

    if (isOpen && (key === 'Escape' || key === 'Tab')) {
      if (key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
      closePopover();
      return;
    }

    if (isOpen && (key === 'Enter' || key === ' ')) {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (onInputChange && activeIndex === filteredOptions.length)
        handleCustomMenuItemClick();
      else if (option) handleSelect(option);
      else closePopover();
      return;
    }

    const arrow = key === 'ArrowUp' || key === 'ArrowDown';
    const endpoint = key === 'Home' || key === 'End';
    if (!arrow && !(isOpen && endpoint)) return;

    event.preventDefault();
    const indices = filteredOptions.flatMap((option, index) =>
      option.disabled ? [] : [index]
    );
    if (onInputChange) indices.push(filteredOptions.length);
    if (!indices.length) return;
    const selectedIndex = filteredOptions.findIndex(
      option => option.value === selected?.value
    );
    const currentIndex = indices.indexOf(
      activeIndex < 0 ? selectedIndex : activeIndex
    );
    const lastIndex = indices.length - 1;
    scrollToActive.current = true;
    let nextIndex = currentIndex;
    if (key === 'Home') nextIndex = 0;
    if (key === 'End') nextIndex = lastIndex;
    if (key === 'ArrowDown' && isOpen) nextIndex += 1;
    if (key === 'ArrowUp' && isOpen) nextIndex -= 1;
    if (currentIndex === -1 && key === 'ArrowUp') nextIndex = lastIndex;
    setActiveIndex(indices[clamp(nextIndex, 0, lastIndex)]);
    if (!isOpen) openPopover();
  };

  const pointAtOption = (index: number) => {
    scrollToActive.current = false;
    setActiveIndex(index);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative text-center',
        variant && selectorWidths[variant],
        className
      )}
    >
      <div
        className={cn(
          selectorTriggerClass,
          isOpen && (popoverPos.above ? 'rounded-t-none' : 'rounded-b-none'),
          disabled && 'opacity-60'
        )}
      >
        {isCustomInput ? (
          <input
            ref={inputRef}
            type="text"
            aria-label={accessibleLabel}
            aria-labelledby={labelledBy}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={disabled}
            className="h-full w-full bg-transparent px-2 text-left text-sm text-text-primary outline-none"
            value={typeof selected?.label === 'string' ? selected.label : ''}
            onChange={handleInputChange}
            onBlur={() => {
              setIsCustomInput(false);
              onInputBlur?.();
            }}
            onKeyDown={e => {
              handleStepKeyDown(e);
              if (e.key === 'Enter' || e.key === 'Escape') {
                setIsCustomInput(false);
                onInputBlur?.();
              }
            }}
          />
        ) : (
          <button
            id={buttonId}
            ref={triggerRef}
            type="button"
            role="combobox"
            aria-label={accessibleLabel}
            aria-labelledby={labelledBy}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onClick={handleToggle}
            className={cn(
              'flex h-full w-full cursor-pointer items-center justify-between px-2 text-left outline-none',
              disabled && 'cursor-not-allowed'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={popoverId}
            aria-activedescendant={activeOptionId}
            disabled={disabled}
            onKeyDown={handleTriggerKeyDown}
          >
            <span
              className="block min-w-0 flex-1 truncate text-left font-normal leading-6 text-text-primary"
              style={selected?.style}
            >
              {hasValue ? selected?.label : placeholder}
            </span>

            <div
              className={cn(
                'flex-center h-6 w-4 shrink-0 transition-transform duration-200',
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
        role="listbox"
        aria-label={accessibleLabel}
        aria-labelledby={labelledBy}
        aria-hidden={!isOpen}
        className={cn(
          selectorListClass,
          popoverPos.above
            ? 'rounded-b-none border-b-0'
            : 'rounded-t-none border-t-0'
        )}
        style={{
          top: popoverPos.above ? undefined : popoverPos.offset,
          bottom: popoverPos.above ? popoverPos.offset : undefined,
          maxHeight: popoverPos.maxHeight,
          left: `${popoverPos.left}px`,
          width: `${popoverPos.width}px`,
        }}
      >
        {searchable && (
          <div className="sticky top-0 z-10 p-1 bg-bg-base border-b border-border-neutral rounded-md">
            <Input
              type="text"
              placeholder="검색"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setActiveIndex(-1);
              }}
              className="w-full h-8 px-2 text-xs bg-transparent border border-border-neutral rounded-md outline-none focus:border-primary text-text-primary placeholder:text-text-disabled"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
        {filteredOptions.map((option, index) => (
          <Fragment key={option.value}>
            {option.group &&
              option.group !== filteredOptions[index - 1]?.group && (
                <li
                  role="presentation"
                  className="border-y border-border-neutral bg-bg-sub px-3 py-1.5 text-left text-xs font-semibold text-text-secondary"
                >
                  {option.group}
                </li>
              )}
            <li
              id={`${popoverId}-${index}`}
              data-option-value={onOptionVisible ? option.value : undefined}
              onClick={() => handleSelect(option)}
              onPointerMove={
                option.disabled ? undefined : () => pointAtOption(index)
              }
              className={cn(
                selectorOptionClass,
                activeIndex === index && 'bg-bg-sub',
                option.disabled &&
                  'cursor-not-allowed text-text-secondary opacity-60 hover:bg-transparent'
              )}
              role="option"
              aria-selected={selected?.value === option.value}
              aria-disabled={option.disabled}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex-center w-6 shrink-0 pl-2',
                  selected?.value !== option.value && 'invisible'
                )}
              >
                <CheckIcon width={12} height={12} />
              </span>
              <span className="min-w-0 truncate leading-7" style={option.style}>
                {option.label}
              </span>
            </li>
          </Fragment>
        ))}

        {onInputChange && (
          <li
            id={`${popoverId}-${filteredOptions.length}`}
            role="option"
            aria-selected={false}
            onClick={handleCustomMenuItemClick}
            onPointerMove={() => pointAtOption(filteredOptions.length)}
            className={cn(
              selectorOptionClass,
              'pl-7',
              activeIndex === filteredOptions.length && 'bg-bg-sub'
            )}
          >
            직접입력
          </li>
        )}
      </ul>
    </div>
  );
};
