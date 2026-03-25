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
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { cn } from '@/shared/utils/cn';

import type { JSONContent } from '@tiptap/react';

interface PopupProps {
  popupTitle?: string;
  options: JSONContent[];
  onSelect?: (content: JSONContent, index: number) => void;
  onClose?: () => void;
  name?: string;
  selectedContent?: JSONContent;
  defaultSelectedContent?: JSONContent;
}

interface ItemProps {
  content: JSONContent;
  seperateIndex?: number;
  isSelected: boolean;
  isExpanded: boolean;
  name: string;
  onSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
}

const OptionItem = ({
  content,
  seperateIndex = 0,
  isSelected,
  isExpanded,
  name,
  onSelect,
  onToggle,
}: ItemProps) => {
  // Extract summary (first non-empty content node or as specified by seperateIndex)
  const summaryContent: JSONContent = {
    type: 'doc',
    content: content.content
      ? [content.content[seperateIndex] || content.content[0]]
      : [],
  };

  const fullHtml = tiptapJsonToHtmlUniversal(content);
  const summaryHtml = tiptapJsonToHtmlUniversal(summaryContent);

  return (
    <li className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="pt-4">
          <Radio
            name={name}
            value={JSON.stringify(content)}
            checked={isSelected}
            onChange={onSelect}
          />
        </div>
        <div
          className="flex-1 cursor-pointer rounded-2xl bg-bg-sub p-4"
          onClick={onToggle}
        >
          <div
            className={cn(
              'text-start text-sm text-text-primary prose prose-sm max-w-none',
              !isExpanded && 'line-clamp-2 overflow-hidden'
            )}
            dangerouslySetInnerHTML={{
              __html: isExpanded ? fullHtml : summaryHtml,
            }}
          />
        </div>
      </div>
    </li>
  );
};

export function PopupOptionsJSON({
  popupTitle = '항목 추가',
  options,
  onSelect,
  onClose,
  name,
  selectedContent,
  defaultSelectedContent,
}: PopupProps) {
  const autoName = useId();
  const radioName = name ?? `popup-layer-${autoName}`;
  const isControlled = selectedContent !== undefined;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [innerSelectedContent, setInnerSelectedContent] = useState<
    JSONContent | undefined
  >(defaultSelectedContent);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const currentSelectedContent = isControlled
    ? selectedContent
    : innerSelectedContent;

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const nextContent = JSON.parse(e.target.value) as JSONContent;
    const nextIndex = options.findIndex(
      option => JSON.stringify(option) === e.target.value
    );

    if (!isControlled) {
      setInnerSelectedContent(nextContent);
    }

    if (nextIndex !== -1) {
      onSelect?.(nextContent, nextIndex);
    }
  };

  const handleBackdropClick = () => handleClose();
  const handleDialogClick = (event: MouseEvent<HTMLElement>) =>
    event.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={handleDialogClick}
      >
        <NavigationBar
          action={
            <UtilityButton
              size="md"
              variant="danger"
              onClick={handleClose}
              className="text-sm px-4"
            >
              닫기
            </UtilityButton>
          }
          direction="right"
          className="border-b px-4 py-3 bg-slate-50"
        >
          <span className="font-bold text-lg">{popupTitle}</span>
        </NavigationBar>

        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-3">
            {options.length === 0 ? (
              <li className="text-start py-10 text-text-secondary italic">
                표시할 항목이 없습니다.
              </li>
            ) : (
              options.map((content, index) => (
                <OptionItem
                  key={`${JSON.stringify(content)}-${index}`}
                  content={content}
                  isSelected={
                    JSON.stringify(currentSelectedContent) ===
                    JSON.stringify(content)
                  }
                  isExpanded={expandedIndex === index}
                  onToggle={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  name={radioName}
                  onSelect={handleSelect}
                />
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
