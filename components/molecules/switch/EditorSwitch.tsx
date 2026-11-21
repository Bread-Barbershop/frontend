import { useId, type Ref } from 'react';

import { TOGGLE_TRACK } from '@/components/atoms/toggle-track/ToggleTrack.style';
import { cn } from '@/shared/utils/cn';

type EditorSwitchProps = {
  label: string;
  ariaLabel?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  inputRef?: Ref<HTMLInputElement>;
};

export function EditorSwitch({
  label,
  ariaLabel,
  description,
  checked,
  onChange,
  inputRef,
}: EditorSwitchProps) {
  const labelId = useId();
  const descriptionId = useId();
  const { width, height, knobSize, knobTravel, knobShadow, on, off } =
    TOGGLE_TRACK;
  const colors = checked ? on : off;

  return (
    <label className="relative flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-between gap-2.5 text-sm">
      <span className="min-w-0 wrap-anywhere">
        <span id={labelId} className="block font-medium">
          {label}
        </span>
        {description && (
          <span
            id={descriptionId}
            className="block text-xs text-text-secondary"
          >
            {description}
          </span>
        )}
      </span>
      <input
        ref={inputRef}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={event => onChange(event.currentTarget.checked)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelId}
        aria-describedby={description ? descriptionId : undefined}
        className="peer absolute inset-0 m-0 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        className="relative shrink-0 overflow-hidden rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary motion-safe:transition-[background-color,border-color,box-shadow] motion-safe:duration-200"
        style={{
          width,
          height,
          borderColor: checked ? '#547EB8' : '#AA626B',
          backgroundColor: colors.backgroundColor,
          boxShadow: colors.shadow,
        }}
      >
        <span
          className="absolute top-px left-px z-10 rounded-full border border-white/25 motion-safe:transition-[transform,background-color] motion-safe:duration-200 motion-safe:ease-out"
          style={{
            width: knobSize,
            height: knobSize,
            backgroundColor: colors.knobColor,
            boxShadow: knobShadow,
            transform: `translateX(${checked ? knobTravel : 0}px)`,
          }}
        />
        <span
          className={cn(
            'absolute top-px left-px grid place-items-center text-xs leading-none font-semibold text-[#1756BA] motion-safe:transition-opacity',
            checked ? 'opacity-100 motion-safe:delay-100' : 'opacity-0'
          )}
          style={{ width: knobTravel, height: knobSize }}
        >
          ON
        </span>
        <span
          className={cn(
            'absolute top-px right-px grid place-items-center text-xs leading-none font-semibold text-[#A51F30] motion-safe:transition-opacity',
            checked ? 'opacity-0' : 'opacity-100 motion-safe:delay-100'
          )}
          style={{ width: knobTravel, height: knobSize }}
        >
          OFF
        </span>
      </span>
    </label>
  );
}
