'use client';

import {
  resolveSectionStyle,
  SECTION_STYLE_OPTIONS,
  type SectionStyle,
} from '@/shared/data/sectionStyles';

export function SectionStyleSelect({
  label,
  value,
  onChange,
  inheritLabel,
}: {
  label: string;
  value: SectionStyle | undefined;
  onChange: (value: SectionStyle | undefined) => void;
  inheritLabel?: string;
}) {
  return (
    <label className="flex w-full flex-col gap-2 text-xs font-medium">
      {label}
      <select
        className="h-9 w-full rounded-md border border-border-divider bg-white px-2 text-sm font-normal"
        value={value ?? ''}
        onChange={event => onChange(resolveSectionStyle(event.target.value))}
      >
        {(inheritLabel || value === undefined) && (
          <option value="">{inheritLabel ?? '현재 스타일'}</option>
        )}
        {SECTION_STYLE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
