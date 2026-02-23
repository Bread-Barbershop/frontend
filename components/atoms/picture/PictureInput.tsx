import { VariantProps } from 'class-variance-authority';
import { InputHTMLAttributes, useId } from 'react';

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
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>사진 추가 버튼</title>
          <path
            d="M0.800049 7.80078H14.8M7.80005 0.800781V14.8008"
            stroke="black"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </label>
    </>
  );
};
