'use client';

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Radio } from '@/components/atoms/radio';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { PopupText } from '@/components/molecules/popup-text';
import { cn } from '@/shared/utils/cn';

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
}: PopupProps) {
  const autoName = useId();
  const radioName = name ?? `popup-${autoName}`;
  const isControlled = selectedText !== undefined;
  const [innerSelectedText, setInnerSelectedText] = useState(
    defaultSelectedText ?? ''
  );
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // 선택 상태는 controlled/ uncontrolled 두 방식을 모두 지원한다.
  const currentSelectedText = isControlled ? selectedText : innerSelectedText;

  // 모달이 열려있는 동안 Esc 키로 닫기 이벤트를 부모에 전달한다.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

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

  // 배경(overlay) 클릭 시 팝업 닫기.
  const handleBackdropClick = () => {
    handleClose();
  };

  // 팝업 본문 클릭은 배경 클릭 이벤트로 전파되지 않게 차단한다.
  const handleDialogClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <section
        aria-label={popupTitle}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-93.75 rounded-lg bg-white px-4 pb-4 shadow-edit"
        onClick={handleDialogClick}
      >
        <NavigationBar
          action={
            <UtilityButton
              size="md"
              variant="danger"
              onClick={handleClose}
              aria-label="닫기"
              className="text-sm"
            >
              닫기
            </UtilityButton>
          }
          direction="right"
        >
          {popupTitle}
        </NavigationBar>

        <ul className=" max-h-120 overflow-y-auto space-y-2 pr-1">
          {options.length === 0 && (
            <li className="px-2 py-3 text-sm text-text-secondary text-center">
              표시할 항목이 없습니다.
            </li>
          )}

          {options.map((text, index) => (
            <li
              key={`${text}-${index}`}
              className={cn('flex items-start gap-3 p-1', listClassName)}
            >
              <div className={cn('pt-3', radioClassName)}>
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
      </section>
    </div>
  );
}

export default PopupOptions;
