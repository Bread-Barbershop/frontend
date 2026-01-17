import { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

import { actionVariants } from './NavigationBar.style';


interface NavigationBarProps {
  children: ReactNode;
  action?: ReactNode;
  direction?: 'left' | 'right';
  className?: string;
}
export const NavigationBar = ({
  children,
  action,
  direction = 'right',
  className,
}: NavigationBarProps) => {
  return (
    <div
      className={cn(
        'relative flex-center w-full min-h-[44px] bg-transparent',
        className
      )}
    >
      <h3 className="font-semibold leading-[17px] py-[13.5px] text-center">
        {children}
      </h3>
      {action && (
        <div className={cn(actionVariants({ direction }))}>{action}</div>
      )}
    </div>
  );
};
