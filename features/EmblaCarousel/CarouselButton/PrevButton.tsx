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
        `group flex-center rounded-full bg-black/32 w-8 h-8`,
        className
      )}
      aria-label="이전 버튼"
    >
      <SlideArrow className="w-[11px] h-4 text-white group-hover:text-black transition-colors" />
    </Button>
  );
}

export default PrevButton;
