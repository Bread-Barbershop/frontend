'use client';

import { useId, useState, type ChangeEvent, type RefObject } from 'react';

import { Radio } from '@/components/atoms/radio';
import { PopupText } from '@/components/molecules/popup-text';
import { cn } from '@/shared/utils/cn';

import { Popup } from '../popup/Popup';

import {
  CLOSING_CATEGORIES,
  CLOSING_COMMENT_OPTIONS,
  type ClosingCategory,
} from './closingCommentOptions';

interface ClosingQuestionPopupProps {
  onSelect?: (text: string) => void;
  onClose?: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

function ClosingQuestionPopup({
  onSelect,
  onClose,
  triggerRef,
}: ClosingQuestionPopupProps) {
  const autoName = useId();
  const radioName = `closing-${autoName}`;
  const [activeCategory, setActiveCategory] =
    useState<ClosingCategory>('결혼식');
  const [selectedText, setSelectedText] = useState('');

  const options = CLOSING_COMMENT_OPTIONS[activeCategory];

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const nextText = e.target.value;
    const nextIndex = options.findIndex(option => option === nextText);

    setSelectedText(nextText);

    if (nextIndex !== -1) {
      onSelect?.(nextText);
    }
  };

  return (
    <Popup
      popupTitle="문구 예시"
      variant="floating"
      onClose={onClose}
      triggerRef={triggerRef}
      hideCloseButton
      wrapperClassName="h-[370px] w-[280px] px-0"
      contentClassName="min-h-0 flex-1 px-0 pb-3.5 flex flex-col "
    >
      <div className="flex border-b border-border-neutral">
        {CLOSING_CATEGORIES.map(category => (
          <button
            key={category.value}
            onClick={() => {
              setActiveCategory(category.value);
              setSelectedText('');
            }}
            className={cn(
              'flex-1 py-3 px-2 text-xs font-normal transition-colors',
              activeCategory === category.value
                ? 'border-b-2 border-text-primary text-text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <ul
        className={cn(
          'flex-1 max-h-full space-y-3 overflow-y-auto scrollbar-hide px-4 pt-3'
        )}
      >
        {options.length === 0 && (
          <li className="px-2 py-3 text-sm text-text-secondary text-center">
            표시할 항목이 없습니다.
          </li>
        )}

        {options.map((text, index) => (
          <li
            key={`${text}-${index}`}
            className={cn('flex h-9 items-center justify-center gap-2.5 p-0')}
          >
            <div className={cn('flex shrink-0 items-center')}>
              <Radio
                name={radioName}
                value={text}
                checked={selectedText === text}
                onChange={handleSelect}
              />
            </div>

            <PopupText
              text={text}
              className="flex-1 "
              twoLineEllipsis={false}
            />
          </li>
        ))}
      </ul>
    </Popup>
  );
}

export default ClosingQuestionPopup;
