'use client';

import clsx from 'clsx';
import { useMemo } from 'react';

interface BgmToggleButtonProps {
  isOn: boolean;
  onToggle: () => void;
  className?: string;
}

export default function BgmToggleButton({
  isOn,
  onToggle,
  className,
}: BgmToggleButtonProps) {

  const delays = useMemo(() => [0, -0.1, -0.2, -0.3, -0.4], []);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOn ? '배경음악 끄기' : '배경음악 켜기'}
      className={clsx(
        'absolute right-4 top-4 z-50 flex h-6 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md',
        className
      )}
    >
      <div
        className={clsx(
          'flex gap-0.5',
          isOn ? 'items-end' : 'items-center'
        )}
      >
        {delays.map((delay, i) => (
          <span
            key={i}
            className={clsx(
              'w-0.5 h-3 bg-white rounded-full transition-all duration-500',
              isOn
                ? 'animate-eq'
                : 'scale-y-25 opacity-40'
            )}
            style={{
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>
    </button>
  );
}