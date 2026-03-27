import { ComponentProps } from 'react';

import { Button } from '@/components/atoms/button';
import SlideArrow from '@/shared/assets/icons/slideArrow.svg';
import { cn } from '@/shared/utils/cn';

type CarouselControlButtonProps = ComponentProps<typeof Button> & {
  direction: 'left' | 'right';
};

function CarouselControlButton({
  direction,
  className,
  ...props
}: CarouselControlButtonProps) {
  return (
    <Button
      {...props}
      aria-label={direction === 'left' ? '이전 버튼' : '다음 버튼'}
      className={cn(
        'group flex-center h-11 w-11 rounded-full bg-black/48 cursor-pointer',
        className
      )}
    >
      <SlideArrow
        className={cn(
          'h-4 w-4 text-[#6B7280] transition-colors group-hover:text-black',
          direction === 'right' && 'rotate-180'
        )}
      />
    </Button>
  );
}

export default CarouselControlButton;
