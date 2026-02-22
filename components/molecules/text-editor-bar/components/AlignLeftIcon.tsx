import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AlignLeftIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 20, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 20 20"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M3 5.28571C3 4.85178 3.33579 4.5 3.75 4.5H16.25C16.6642 4.5 17 4.85178 17 5.28571C17 5.71965 16.6642 6.07143 16.25 6.07143H3.75C3.33579 6.07143 3 5.71965 3 5.28571Z"
          fill="currentColor"
        />
        <path
          d="M3 11.5714C3 11.1375 3.33579 10.7857 3.75 10.7857H16.25C16.6642 10.7857 17 11.1375 17 11.5714C17 12.0054 16.6642 12.3571 16.25 12.3571H3.75C3.33579 12.3571 3 12.0054 3 11.5714Z"
          fill="currentColor"
        />
        <path
          d="M3 8.42857C3 7.99463 3.33579 7.64286 3.75 7.64286H12.25C12.6642 7.64286 13 7.99463 13 8.42857C13 8.86251 12.6642 9.21429 12.25 9.21429H3.75C3.33579 9.21429 3 8.86251 3 8.42857Z"
          fill="currentColor"
        />
        <path
          d="M3 14.7143C3 14.2803 3.33579 13.9286 3.75 13.9286H12.25C12.6642 13.9286 13 14.2803 13 14.7143C13 15.1482 12.6642 15.5 12.25 15.5H3.75C3.33579 15.5 3 15.1482 3 14.7143Z"
          fill="currentColor"
        />
      </svg>
    );
  }
);

AlignLeftIcon.displayName = 'AlignLeftIcon';
