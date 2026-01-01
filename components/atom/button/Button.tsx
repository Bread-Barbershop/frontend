import { VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { buttonVariants, iconVariants } from './Button.style';

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const ButtonRoot = ({
  children,
  variant,
  size,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
};

interface ButtonIconProps extends VariantProps<typeof iconVariants> {
  children: ReactNode;
  className?: string;
}

const ButtonIcon = ({ children, className, size }: ButtonIconProps) => {
  return (
    <span className={cn(iconVariants({ size }), className)}>{children}</span>
  );
};

export const Button = Object.assign(ButtonRoot, {
  Icon: ButtonIcon,
});
