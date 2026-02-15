import React from 'react';

import { cn } from '@/shared/utils/cn';

import { pictureVariants } from './PictureInput.style';

interface Props {
  value?: string;
  multiple?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const PictureInput = ({
  value,
  multiple,
  onChange,
  className,
}: Props) => {
  return (
    <div>
      <input
        type="file"
        id="file"
        value={value}
        multiple={multiple}
        className="hidden"
        onChange={e => onChange(e)}
      />
      <label
        htmlFor="file"
        className={cn(
          pictureVariants({ className }),
          'relative overflow-hidden'
        )}
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
    </div>
  );
};
