import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const UnderlineIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 32, className, ...props }, ref) => {
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
        <path d="M18.0596 9H20.154V15.7695C20.154 18.0597 18.4896 19.572 15.9931 19.572C13.4965 19.572 11.846 18.0597 11.846 15.7695V9H13.9265V15.5967C13.9265 16.7922 14.7448 17.6708 15.9931 17.6708C17.2552 17.6708 18.0596 16.7922 18.0596 15.5967V9Z" />
        <path d="M11 21.6461H21V23H11V21.6461Z" />
      </svg>
    );
  }
);

UnderlineIcon.displayName = 'UnderlineIcon';
