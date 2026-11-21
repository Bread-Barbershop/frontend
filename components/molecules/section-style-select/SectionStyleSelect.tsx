'use client';

import {
  resolveSectionStyle,
  SECTION_STYLE_OPTIONS,
  type SectionStyle,
} from '@/shared/data/sectionStyles';
import { cn } from '@/shared/utils/cn';

import {
  navigationBarClassName,
  navigationBarHeadingClassName,
} from '../navigation-bar/NavigationBar.style';
import { FormSelector } from '../selector/FormSelector';

export function SectionStyleSelect({
  label,
  value,
  onChange,
  inheritLabel,
  sectionHeading = false,
}: {
  label: string;
  value: SectionStyle | undefined;
  onChange: (value: SectionStyle | undefined) => void;
  inheritLabel?: string;
  sectionHeading?: boolean;
}) {
  const options =
    inheritLabel || value === undefined
      ? [
          { value: '', label: inheritLabel ?? '현재 스타일' },
          ...SECTION_STYLE_OPTIONS,
        ]
      : SECTION_STYLE_OPTIONS;

  return (
    <FormSelector
      label={
        sectionHeading ? (
          <span className={cn(navigationBarClassName, 'leading-normal')}>
            <span className={navigationBarHeadingClassName}>{label}</span>
          </span>
        ) : (
          label
        )
      }
      className="flex w-full flex-col gap-2 text-xs font-medium"
      options={options}
      value={value ?? ''}
      onChange={value => onChange(resolveSectionStyle(value))}
    />
  );
}
