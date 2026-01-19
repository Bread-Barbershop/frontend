import { VariantProps } from "class-variance-authority"
import { forwardRef, TextareaHTMLAttributes } from "react"

import { cn } from "@/shared/utils/cn"

import { multiRowInputVariants } from "./MultiRowInput.style"


interface MultiRowInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof multiRowInputVariants> {
}

export  const MultiRowInput = forwardRef<HTMLTextAreaElement, MultiRowInputProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(multiRowInputVariants({ className }), 'textarea-custom-scrollbar')}
      {...props}
    />
    )
})

MultiRowInput.displayName = 'MultiRowInput';
