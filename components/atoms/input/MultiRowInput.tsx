import { forwardRef, HTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

import { multiRowInputVariants } from './MultiRowInput.style';

interface MultiRowInputProps extends HTMLAttributes<HTMLDivElement> {
  placeholder?: string;
  className?: string;
}

/**
 * width는 고정 377px이며, className으로 너비를 조절할 수 있습니다.
 */
export const MultiRowInput = forwardRef<HTMLDivElement, MultiRowInputProps>(
  ({ className, placeholder = '내용을 입력하세요', ...props }, ref) => {
    return (
      <div
        className={cn(
          'group flex max-h-30 h-30 w-[377px] py-3 pl-3 pr-0.5 rounded-lg border border-transparent bg-border-neutral transition-all duration-100 focus-within:bg-bg-base focus-within:border-primary overflow-hidden',
          className
        )}
      >
        <div className="h-full w-full textarea-custom-scrollbar">
          <div
            ref={ref}
            className={cn(multiRowInputVariants({ className }))}
            contentEditable="true"
            role="textbox"
            data-placeholder={placeholder}
            {...props}
          />
        </div>
      </div>
    );
  }
);

MultiRowInput.displayName = 'MultiRowInput';
