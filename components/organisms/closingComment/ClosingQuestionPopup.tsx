'use client';

import { useId, useState, type RefObject } from 'react';

import { Radio } from '@/components/atoms/radio';
import { PopupText } from '@/components/molecules/popup-text';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { Popup } from '../popup/Popup';

import {
  CLOSING_CATEGORIES,
  getClosingCommentOptions,
} from './closingCommentOptions';

interface ClosingQuestionPopupProps {
  blockInfo: EditorBlock<'closingComment'>;
  onSelect: (text: string) => void;
  onClose?: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

function getSingleBlockProps<
  T extends 'myChild' | 'coupleIntroduction' | 'organizerInformation',
>(blocks: EditorBlock[], component: T) {
  const matches = blocks.filter(
    (block): block is EditorBlock<T> => block.component === component
  );
  return matches.length === 1 ? matches[0].props : undefined;
}

function ClosingQuestionPopup({
  blockInfo,
  onSelect,
  onClose,
  triggerRef,
}: ClosingQuestionPopupProps) {
  const autoName = useId();
  const radioName = `closing-${autoName}`;
  const [activeCategory, setActiveCategory] = useState(blockInfo.type);
  const blocks = useEditorStore(state => state.block);
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { eventName, birthdayName, organizerName } = blockInfo.props;
  const couple = getSingleBlockProps(blocks, 'coupleIntroduction');
  const groom = couple?.groom?.trim();
  const bride = couple?.bride?.trim();
  const coupleNames =
    groom && bride
      ? (couple?.brideFirst ? [bride, groom] : [groom, bride]).join(' · ')
      : undefined;
  const organizer = getSingleBlockProps(
    blocks,
    'organizerInformation'
  )?.organizer?.trim();
  const options = getClosingCommentOptions(activeCategory, {
    childName: getSingleBlockProps(blocks, 'myChild')?.name,
    coupleNames,
    eventName,
    birthdayName,
    organizerName: organizer || organizerName,
  });
  const isEvent = activeCategory === 'seminar' || activeCategory === 'etc';
  const nameField = isEvent ? 'eventName' : 'birthdayName';

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
      <div className="flex px-2.5 gap-2.5 pt-2.5 pb-1.5">
        {CLOSING_CATEGORIES.map(category => (
          <button
            key={category.value}
            aria-pressed={activeCategory === category.value}
            onClick={() => setActiveCategory(category.value)}
            className={cn(
              'flex-1 py-1.5 text-[13px] font-normal transition-colors',
              activeCategory === category.value
                ? 'border-b-[1.5px] border-text-primary text-text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {(isEvent || activeCategory === 'birthday') && (
        <TextField
          className="px-2.5 pb-2"
          label={isEvent ? '행사명' : '생일 주인공'}
          inputProps={{
            placeholder: '선택 입력',
            className: 'min-w-0',
            value: blockInfo.props[nameField] ?? '',
            onChange: e =>
              updateBlock<'closingComment'>(blockInfo.id, {
                [nameField]: e.target.value,
              }),
          }}
        />
      )}
      {activeCategory === 'etc' && !organizer && (
        <TextField
          className="px-2.5 pb-2"
          label="주최자명"
          inputProps={{
            placeholder: '선택 입력',
            className: 'min-w-0',
            value: organizerName ?? '',
            onChange: e =>
              updateBlock<'closingComment'>(blockInfo.id, {
                organizerName: e.target.value,
              }),
          }}
        />
      )}
      <ul
        className={cn(
          'flex-1 max-h-full space-y-3 overflow-y-auto scrollbar-hide px-3 pt-1'
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
            className={cn('flex h-9 items-center justify-center gap-1 p-0')}
          >
            <div className={cn('flex-center shrink-0 w-8 h-8')}>
              <Radio
                name={radioName}
                aria-label={text}
                value={text}
                onChange={() => onSelect(text)}
              />
            </div>

            <PopupText
              text={text}
              className="flex-1 text-[13px]"
              twoLineEllipsis={false}
            />
          </li>
        ))}
      </ul>
    </Popup>
  );
}

export default ClosingQuestionPopup;
