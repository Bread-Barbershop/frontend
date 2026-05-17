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
  listClassName?: string;
  radioClassName?: string;
  textClassName?: string;
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
  listClassName,
  radioClassName,
  textClassName,
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
      wrapperClassName="w-[280px] pb-3"
    >
      <ul className=" max-h-120 overflow-y-auto space-y-2 pr-1">
        {options.length === 0 && (
          <li className="px-2 py-3 text-sm text-text-secondary text-center">
            표시할 항목이 없습니다.
          </li>
        )}

        {options.map((text, index) => (
          <li
            key={`${text}-${index}`}
            className={cn('flex items-center gap-3 p-1', listClassName)}
          >
            <div className={cn('flex shrink-0 items-center', radioClassName)}>
              <Radio
                name={radioName}
                value={text}
                checked={currentSelectedText === text}
                onChange={handleSelect}
              />
            </div>

            <PopupText text={text} className={cn('flex-1', textClassName)} />
          </li>
        ))}
      </ul>
    </Popup>
  );
}

export default PopupOptions;
