import type { ReactNode } from 'react';

export function BlockLabel({
  component,
  children,
}: {
  component: string | null;
  children: ReactNode;
}) {
  const lines =
    component === 'visualEffects'
      ? ['배경 ·', '오프닝 효과']
      : component === 'afterParty'
        ? ['피로연 ·', '애프터파티']
        : null;
  if (!lines) return <>{children}</>;
  return (
    <span className="text-center leading-relaxed">
      {lines.map(line => (
        <span key={line} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
    </span>
  );
}
