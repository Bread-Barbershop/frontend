import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { normalizeDividerSettings } from './dividerSettings';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'divider'>;
  isGuestPage?: boolean;
}

export function DividerBlockPreview({
  blockInfo,
  className,
  isGuestPage = false,
  style,
  ...rest
}: Props) {
  const { height, thickness, color, topSpacing, bottomSpacing } =
    normalizeDividerSettings(blockInfo.props);

  return (
    <div
      {...rest}
      className={cn('relative flex w-full justify-center', className)}
      style={{ ...style, paddingTop: topSpacing, paddingBottom: bottomSpacing }}
      aria-hidden={isGuestPage || undefined}
    >
      <div
        aria-hidden="true"
        style={{ height, width: thickness, backgroundColor: color }}
      />
      {!isGuestPage && (
        <div className="pointer-events-none absolute inset-0 border border-dashed border-border-divider" />
      )}
    </div>
  );
}
