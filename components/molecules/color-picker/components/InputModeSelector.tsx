'use client';

import { ChevronDown } from 'lucide-react';
import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { INPUT_MODE_OPTIONS } from './colorPicker.constants';

import type { InputMode } from './colorPicker.types';

const DROPDOWN_GAP = 4;
const VIEWPORT_GAP = 8;

/**
 * HEX, RGB 입력 모드를 전환하는 컬러피커 전용 셀렉터입니다.
 *
 * 공용 Selector 컴포넌트를 수정하지 않기 위해 별도 구현으로 분리했으며,
 * 디자인 요구사항에 맞는 크기, 보더, 드롭다운 동작을 이 컴포넌트 안에서만 관리합니다.
 */
export function InputModeSelector({
  value,
  onChange,
}: {
  value: InputMode;
  onChange: (mode: InputMode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedOption =
    INPUT_MODE_OPTIONS.find(option => option.value === value) ??
    INPUT_MODE_OPTIONS[0];

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;

    const updatePosition = () => {
      const trigger = containerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const dropdownHeight =
        listRef.current?.offsetHeight ?? INPUT_MODE_OPTIONS.length * 32 + 2;
      const opensUp =
        rect.bottom + DROPDOWN_GAP + dropdownHeight >
        window.innerHeight - VIEWPORT_GAP;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        top: opensUp
          ? Math.max(VIEWPORT_GAP, rect.top - DROPDOWN_GAP - dropdownHeight)
          : rect.bottom + DROPDOWN_GAP,
        width: rect.width,
        visibility: 'visible',
        zIndex: 10000,
      });
    };

    updatePosition();
    const animationFrameId = window.requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-8 w-14 shrink-0">
      <button
        type="button"
        className="relative flex h-8 w-full items-center rounded-sm border-[0.5px] border-[#1F72EF] bg-white pl-2 pr-5 text-left"
        onClick={() => {
          setIsOpen(prev => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block w-full whitespace-nowrap text-center text-[14px] leading-5 text-text-primary">
          {selectedOption.label}
        </span>
        <ChevronDown
          size={14}
          className={`absolute right-1 top-1/2 -translate-y-1/2 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <ul
            ref={listRef}
            className="overflow-hidden rounded-sm border-[0.5px] border-[#1F72EF] bg-white shadow-lg"
            style={dropdownStyle}
            role="listbox"
          >
            {INPUT_MODE_OPTIONS.map(option => (
              <li key={option.value}>
                <button
                  type="button"
                  className="flex h-8 w-full items-center justify-center px-2 text-[14px] leading-5 text-text-primary transition-colors hover:bg-[#F3F8FF]"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
