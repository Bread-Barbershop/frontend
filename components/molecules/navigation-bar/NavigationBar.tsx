import { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

import {
  actionVariants,
  navigationBarClassName,
  navigationBarHeadingClassName,
} from './NavigationBar.style';

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
    <div className={cn(navigationBarClassName, className)}>
      <h3 className={navigationBarHeadingClassName}>{children}</h3>
      {action && (
        <div className={cn(actionVariants({ direction }))}>{action}</div>
      )}
    </div>
  );
};
