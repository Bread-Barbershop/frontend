import { TOGGLE_TRACK } from '@/components/atoms/toggle-track/ToggleTrack.style';

type VisibilityToggleProps = {
  isPublished: boolean;
  disabled?: boolean;
  isBusy?: boolean;
  hasError?: boolean;
  onToggle?: () => void;
};

function VisibilityToggle({
  isPublished,
  disabled = false,
  isBusy = false,
  hasError = false,
  onToggle,
}: VisibilityToggleProps) {
  const label = isPublished ? '공개' : '비공개';
  const { width, height, knobSize, knobTravel, knobShadow, on, off } =
    TOGGLE_TRACK;
  const colors = isPublished ? on : off;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-pressed={isPublished}
        onClick={event => {
          event.stopPropagation();
          if (disabled) return;
          onToggle?.();
        }}
        className={`dashboard-visibility-toggle relative overflow-hidden rounded-full disabled:cursor-not-allowed ${
          hasError ? 'dashboard-visibility-toggle--error' : ''
        }`}
        style={{
          width,
          height,
          padding: 1,
          border: `1px solid ${colors.borderColor}`,
          backgroundColor: colors.backgroundColor,
          boxShadow: colors.shadow,
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
            width: knobSize,
            height: knobSize,
            backgroundColor: colors.knobColor,
            border: '1px solid rgba(255, 255, 255, 0.24)',
            boxShadow: knobShadow,
            transition:
              'transform 1000ms cubic-bezier(0.16,1,0.3,1), background-color 500ms ease 500ms',
            transform: isPublished
              ? `translateX(${knobTravel}px)`
              : 'translateX(0)',
          }}
        >
          {isBusy && (
            <span
              className="h-[12px] w-[12px] animate-spin rounded-full border-[2px] border-current/25 border-t-current"
              style={{ color: colors.labelColor }}
            />
          )}
        </span>

        {/* 텍스트 — 공개 */}
        <span
          aria-hidden
          className="absolute top-[1px] left-[1px] flex items-center justify-center font-pretendard text-[12px] font-medium leading-none"
          style={{
            width: knobTravel,
            height: knobSize,
            color: on.labelColor,
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
            width: knobTravel,
            height: knobSize,
            color: off.labelColor,
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
