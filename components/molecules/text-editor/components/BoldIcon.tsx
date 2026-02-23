import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const BoldIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path d="M11 22.5V9.5H16.1706C19.0431 9.5 20.4794 10.8826 20.4794 12.8398C20.4794 14.366 19.4919 15.3177 18.1454 15.6229V15.7486C19.6176 15.8204 21 16.9876 21 18.9088C21 20.9738 19.456 22.5 16.5117 22.5H11ZM15.9731 20.2735C17.535 20.2735 18.1993 19.6271 18.1993 18.6575C18.1993 17.5622 17.3734 16.7901 16.0449 16.7901H13.693V20.2735H15.9731ZM15.7756 14.9406C16.9066 14.9406 17.7504 14.3122 17.7504 13.2707C17.7504 12.337 17.0682 11.6906 15.8294 11.6906H13.693V14.9406H15.7756Z" />
      </svg>
    );
  }
);

BoldIcon.displayName = 'BoldIcon';
