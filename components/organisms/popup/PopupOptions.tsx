'use client';

import { useId, useState, type ChangeEvent, type RefObject } from 'react';

import { Radio } from '@/components/atoms/radio';
import { PopupText } from '@/components/molecules/popup-text';
import { cn } from '@/shared/utils/cn';

import { Popup } from './Popup';

interface PopupProps {
  popupTitle?: string;
  options: string[]; // 부모 문자열 배열.
  onSelect?: (text: string, index: number) => void;
  onClose?: () => void;
  name?: string;
  selectedText?: string;
  defaultSelectedText?: string;
  listWrapperClassName?: string;
  listClassName?: string;
  radioClassName?: string;
  textClassName?: string;
  twoLineEllipsis?: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
}

function PopupOptions({
  popupTitle = '항목 추가',
  options,
  onSelect,
  onClose,
  name,
  selectedText,
  defaultSelectedText,
  listWrapperClassName,
  listClassName,
  radioClassName,
  textClassName,
  twoLineEllipsis = false,
  triggerRef,
}: PopupProps) {
  const autoName = useId();
  const radioName = name ?? `popup-${autoName}`;
  const isControlled = selectedText !== undefined;
  const [innerSelectedText, setInnerSelectedText] = useState(
    defaultSelectedText ?? ''
  );

  // 선택 상태는 controlled/ uncontrolled 두 방식을 모두 지원한다.
  const currentSelectedText = isControlled ? selectedText : innerSelectedText;

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const nextText = e.target.value;
    const nextIndex = options.findIndex(option => option === nextText);

    // 비제어 모드일 때만 내부 상태를 갱신한다.
    if (!isControlled) {
      setInnerSelectedText(nextText);
    }

    // 부모에 선택 텍스트와 인덱스를 전달한다.
    if (nextIndex !== -1) {
      onSelect?.(nextText, nextIndex);
    }
  };

  return (
    <Popup
      popupTitle={popupTitle}
      variant="floating"
      onClose={onClose}
      triggerRef={triggerRef}
      hideCloseButton
      wrapperClassName="h-[370px] w-[280px] px-0"
      contentClassName="min-h-0 flex-1 px-4 pb-3.5"
    >
      <ul
        className={cn(
          'h-full max-h-full space-y-3 overflow-y-auto scrollbar-hide',
          listWrapperClassName
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
            className={cn(
              'flex h-9 items-center justify-center gap-2.5 p-0',
              listClassName
            )}
          >
            <div className={cn('flex shrink-0 items-center', radioClassName)}>
              <Radio
                name={radioName}
                value={text}
                checked={currentSelectedText === text}
                onChange={handleSelect}
              />
            </div>

            <PopupText
              text={text}
              className={cn('flex-1', textClassName)}
              twoLineEllipsis={twoLineEllipsis}
            />
          </li>
        ))}
      </ul>
    </Popup>
  );
}

export default PopupOptions;
