import { ChangeEvent } from 'react';

interface RangeControlProps {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  allowNegative?: boolean;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
  onDisplayValueChange: (value: string) => void;
}

const sliderClassName =
  'h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#3B82F6] disabled:cursor-not-allowed disabled:accent-[#787878] ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6] disabled:[&::-webkit-slider-thumb]:bg-[#787878] ' +
  '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3B82F6] disabled:[&::-moz-range-thumb]:bg-[#787878] [&::-moz-range-thumb]:border-none';
export const RangeControl = ({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  disabled = false,
  allowNegative = false,
  onChange,
  onCommit,
  onDisplayValueChange,
}: RangeControlProps) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const filteredValue = rawValue.replace(
      allowNegative ? /[^0-9-]/g : /[^0-9]/g,
      ''
    );

    if (
      filteredValue !== '' &&
      filteredValue !== '-' &&
      !(allowNegative ? /^-?\d+$/ : /^\d+$/).test(filteredValue)
    ) {
      return;
    }

    onDisplayValueChange(filteredValue);

    if (filteredValue !== '' && filteredValue !== '-') {
      onChange(Number(filteredValue));
    }
  };

  const handleInputBlur = () => {
    const parsedValue = Number(displayValue);
    const nextValue =
      displayValue === '' || displayValue === '-' || Number.isNaN(parsedValue)
        ? value
        : parsedValue;

    onCommit(nextValue);
  };

  return (
    <div className="bg-bg-base flex w-full items-center py-1">
      <p className="w-[47px] px-2 text-center text-sm font-semibold text-text-primary">
        {label}
      </p>
      <div className="flex-1 px-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          className={sliderClassName}
          onChange={event => {
            onChange(Number(event.target.value));
          }}
          onMouseUp={event => {
            onCommit(Number(event.currentTarget.value));
          }}
          onTouchEnd={event => {
            onCommit(Number(event.currentTarget.value));
          }}
        />
      </div>
      <input
        type="text"
        value={displayValue}
        disabled={disabled}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="flex h-[32px] w-[47px] items-center justify-center rounded-lg border border-border-neutral bg-bg-base text-center text-xs focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:text-text-tertiary"
      />
    </div>
  );
};
