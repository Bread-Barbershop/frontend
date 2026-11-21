import { VariantProps } from 'class-variance-authority';
import { InputHTMLAttributes, useId } from 'react';

import Add from '@/shared/assets/icons/add.svg';
import { cn } from '@/shared/utils/cn';

import { pictureInputVariants } from './PictureInput.style';

interface Props
  extends
    InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof pictureInputVariants> {}

export const PictureInput = ({
  id,
  children,
  className,
  'aria-label': ariaLabel = '사진 추가',
  ...rest
}: Props) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <>
      <input
        type="file"
        accept="image/*"
        id={inputId}
        aria-label={ariaLabel}
        className="peer sr-only"
        {...rest}
      />
      <label
        htmlFor={inputId}
        title={ariaLabel}
        className={cn(
          pictureInputVariants(),
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
          className
        )}
      >
        {children ?? <Add aria-hidden="true" className="size-4" />}
      </label>
    </>
  );
};
