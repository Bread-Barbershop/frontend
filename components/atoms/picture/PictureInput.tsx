import { VariantProps } from 'class-variance-authority';
import { InputHTMLAttributes, useId } from 'react';

import Add from '@/shared/assets/icons/add.svg';
import { cn } from '@/shared/utils/cn';

import { pictureInputVariants } from './PictureInput.style';

interface Props
  extends
    InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof pictureInputVariants> {}

export const PictureInput = ({ multiple, className, ...rest }: Props) => {
  const generatedId = useId();

  return (
    <>
      <input
        type="file"
        accept="image/*"
        id={generatedId}
        multiple={multiple}
        className="hidden"
        {...rest}
      />
      <label
        htmlFor={generatedId}
        className={cn(pictureInputVariants(), className)}
      >
        <Add className="w-4 h-4" />
      </label>
    </>
  );
};
