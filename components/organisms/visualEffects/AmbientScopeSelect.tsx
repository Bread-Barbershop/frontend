'use client';

import { FormSelector } from '@/components/molecules/selector/FormSelector';
import type { AmbientScope } from '@/shared/utils/invitationEffects';

const SCOPE_OPTIONS = [
  { value: 'poster', label: '메인 포스터에만' },
  { value: 'screen', label: '화면 전체에' },
] as const;

export function AmbientScopeSelect({
  value,
  onChange,
}: {
  value: AmbientScope;
  onChange: (scope: AmbientScope) => void;
}) {
  return (
    <FormSelector
      label="표시 범위"
      className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary"
      options={SCOPE_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
