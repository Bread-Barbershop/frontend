'use client';

import type { AmbientScope } from '@/shared/utils/invitationEffects';

export function AmbientScopeSelect({
  value,
  onChange,
}: {
  value: AmbientScope;
  onChange: (scope: AmbientScope) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
      표시 범위
      <select
        className="h-9 rounded-md border border-border-divider bg-white px-2 text-sm text-text-primary"
        value={value}
        onChange={event => onChange(event.target.value as AmbientScope)}
      >
        <option value="poster">메인 포스터에만</option>
        <option value="screen">화면 전체에</option>
      </select>
    </label>
  );
}
