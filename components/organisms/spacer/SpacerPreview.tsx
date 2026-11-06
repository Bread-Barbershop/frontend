import type { HTMLAttributes } from 'react';

import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { clampSpacerHeight } from './spacerHeight';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'spacer'>;
  isGuestPage?: boolean;
}

export function SpacerPreview({
  blockInfo,
  className,
  isGuestPage = false,
  style,
  ...rest
}: Props) {
  const height = clampSpacerHeight(blockInfo.props.height);
  return (
    <div
      {...rest}
      className={cn('relative w-full', className)}
      style={{ ...style, height }}
      aria-hidden={isGuestPage || undefined}
    >
      {!isGuestPage && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center border border-dashed border-border-divider text-[10px] text-text-tertiary select-none">
          여백 · {height}px
        </div>
      )}
    </div>
  );
}
