import { useCallback, useRef, useState } from 'react';

import Confirm from '@/components/molecules/confirm/Confirm';

type VisibilityToggleProps = {
  invitationTitle: string;
  isPublished: boolean;
  disabled?: boolean;
  isBusy?: boolean;
  hasError?: boolean;
  onToggle?: () => void;
};

const TOGGLE_KNOB_SHADOW = [
  '1px 2px 3px rgba(0, 0, 0, 0.24)',
  'inset -1.5px -1.5px 0.5px -1px rgba(255, 255, 255, 1)',
  'inset 1.5px 1.5px 0.5px -1px rgba(255, 255, 255, 1)',
].join(', ');

const KNOB_SIZE = 24;
const KNOB_TRAVEL = 44;

function VisibilityToggle({
  invitationTitle,
  isPublished,
  disabled = false,
  isBusy = false,
  hasError = false,
  onToggle,
}: VisibilityToggleProps) {
  const label = isPublished ? '공개' : '비공개';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-pressed={isPublished}
        aria-haspopup={isPublished ? 'dialog' : undefined}
        onClick={event => {
          event.stopPropagation();
          if (disabled) return;
          if (isPublished) {
            event.currentTarget.focus();
            setConfirmOpen(true);
          } else {
            onToggle?.();
          }
        }}
        className={`dashboard-visibility-toggle relative overflow-hidden rounded-full disabled:cursor-not-allowed ${
          hasError ? 'dashboard-visibility-toggle--error' : ''
        }`}
        style={{
          width: 72,
          height: 28,
          padding: 1,
          border: `1px solid ${isPublished ? '#AACCFF' : '#FFC8C8'}`,
          backgroundColor: isPublished ? '#F6FAFF' : '#FFFBFB',
          boxShadow: isPublished
            ? 'inset 3px 2px 4px rgba(2, 43, 105, 0.32)'
            : 'inset 3px 2px 4px rgba(2, 43, 105, 0)',
          transition:
            'background-color 500ms ease, border-color 500ms ease, box-shadow 500ms ease',
          transitionDelay: '500ms',
        }}
      >
        {/* 노브 */}
        <span
          aria-hidden
          className="absolute top-[1px] left-[1px] flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            backgroundColor: isPublished ? '#E2EFFF' : '#FFDFDF',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            boxShadow: TOGGLE_KNOB_SHADOW,
            transition:
              'transform 1000ms cubic-bezier(0.16,1,0.3,1), background-color 500ms ease 500ms',
            transform: isPublished
              ? `translateX(${KNOB_TRAVEL}px)`
              : 'translateX(0)',
          }}
        >
          {isBusy && (
            <span
              className="h-[12px] w-[12px] animate-spin rounded-full border-[2px] border-current/25 border-t-current"
              style={{ color: isPublished ? '#1F72EF' : '#FF5C5C' }}
            />
          )}
        </span>

        {/* 텍스트 — 공개 */}
        <span
          aria-hidden
          className="absolute top-[1px] left-[1px] flex items-center justify-center font-pretendard text-[12px] font-medium leading-none"
          style={{
            width: KNOB_TRAVEL,
            height: KNOB_SIZE,
            color: '#1F72EF',
            opacity: isPublished ? 1 : 0,
            transform: isPublished ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'opacity 400ms ease, transform 400ms ease',
            transitionDelay: isPublished ? '600ms' : '0ms',
          }}
        >
          공개
        </span>

        {/* 텍스트 — 비공개 */}
        <span
          aria-hidden
          className="absolute top-[1px] right-[1px] flex items-center justify-center font-pretendard text-[12px] font-medium leading-none"
          style={{
            width: KNOB_TRAVEL,
            height: KNOB_SIZE,
            color: '#FF5C5C',
            opacity: isPublished ? 0 : 1,
            transform: isPublished ? 'translateX(4px)' : 'translateX(0)',
            transition: 'opacity 400ms ease, transform 400ms ease',
            transitionDelay: isPublished ? '0ms' : '600ms',
          }}
        >
          비공개
        </span>

        <span className="sr-only">{label}</span>
      </button>

      {confirmOpen && (
        <Confirm
          ref={dialogRef}
          message={`‘${invitationTitle}’ 전체를 비공개로 전환할까요?`}
          description="기본 초대장과 모든 하객 그룹이 함께 비공개로 바뀌어요. 다시 공개할 때까지 이미 보낸 링크로도 초대장을 볼 수 없어요."
          confirmText="전체 비공개로 전환"
          cancelText="취소"
          initialFocus="cancel"
          variant="white"
          yPosition="center"
          actionButtonClassName="w-auto min-w-[66px] whitespace-nowrap px-3"
          onClose={closeConfirm}
          onCancel={closeConfirm}
          onConfirm={() => {
            closeConfirm();
            if (isPublished && !disabled) onToggle?.();
          }}
        />
      )}

      <style>{`
        @keyframes dashboard-visibility-toggle-shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-2px); }
          40%       { transform: translateX(2px); }
          60%       { transform: translateX(-1px); }
          80%       { transform: translateX(1px); }
        }
        .dashboard-visibility-toggle--error {
          animation: dashboard-visibility-toggle-shake 260ms ease-in-out;
        }
      `}</style>
    </>
  );
}

export default VisibilityToggle;
