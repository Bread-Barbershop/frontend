import React from 'react';

import { Button } from '@/components/atoms/button';
import SlideArrow from '@/shared/assets/icons/slideArrow.svg';
import { cn } from '@/shared/utils/cn';

function NextButton({
  className,
  ...rest
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...rest}
      className={cn(
        'group flex-center rounded-full bg-black/32 w-8 h-8 ',
        className
      )}
      aria-label="다음 버튼"
    >
      <SlideArrow className="w-[11px] h-4 rotate-180 text-white group-hover:text-black transition-colors" />
    </Button>
  );
}

export default NextButton;
