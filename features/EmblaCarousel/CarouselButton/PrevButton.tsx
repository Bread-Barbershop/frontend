import React from 'react';

import { Button } from '@/components/atoms/button';
import SlideArrow from '@/shared/assets/icons/slideArrow.svg';
import { cn } from '@/shared/utils/cn';

function PrevButton({
  className,
  ...rest
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...rest}
      className={cn(
        'group flex-center rounded-full bg-white/70 hover:bg-white text-gray-700 hover:text-black shadow-sm backdrop-blur-[2px] border border-black/10 w-8 h-8 transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none',
        className
      )}
      aria-label="이전 버튼"
    >
      <SlideArrow className="w-[11px] h-4 text-gray-700 group-hover:text-black transition-colors" />
    </Button>
  );
}

export default PrevButton;
