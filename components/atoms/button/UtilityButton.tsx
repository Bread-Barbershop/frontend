import { VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/utils/cn";

import { utilityButtonVariants } from "./UtilityButton.style";

export interface UtilityButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof utilityButtonVariants> {}



export const UtilityButton = ({
  children,
  variant,
  size,
  type = 'button',
  className,
  ...props
}: UtilityButtonProps) => {
  return (
    <button
      className={cn(utilityButtonVariants({ variant, size }), className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}