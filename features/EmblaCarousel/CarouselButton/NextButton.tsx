import React from 'react';

import { Button } from '@/components/atoms/button';
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
      <svg
        width="11"
        height="16"
        viewBox="0 0 11 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.00032 1L9.16699 8L1.00032 15"
          className="stroke-white group-hover:stroke-black transition-colors"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  );
}

export default NextButton;
