import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AlignRightIcon = React.forwardRef<SVGSVGElement, IconProps>(
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
          d="M17 5.28571C17 4.85178 16.6642 4.5 16.25 4.5H3.75C3.33579 4.5 3 4.85178 3 5.28571C3 5.71965 3.33579 6.07143 3.75 6.07143H10H16.25C16.6642 6.07143 17 5.71965 17 5.28571Z"
          fill="currentColor"
        />
        <path
          d="M17 11.5714C17 11.1375 16.6642 10.7857 16.25 10.7857H3.75C3.33579 10.7857 3 11.1375 3 11.5714C3 12.0054 3.33579 12.3571 3.75 12.3571H16.25C16.6642 12.3571 17 12.0054 17 11.5714Z"
          fill="currentColor"
        />
        <path
          d="M17 8.42857C17 7.99463 16.6642 7.64286 16.25 7.64286H7.75C7.33579 7.64286 7 7.99463 7 8.42857C7 8.86251 7.33579 9.21429 7.75 9.21429H16.25C16.6642 9.21429 17 8.86251 17 8.42857Z"
          fill="currentColor"
        />
        <path
          d="M17 14.7143C17 14.2803 16.6642 13.9286 16.25 13.9286H7.75C7.33579 13.9286 7 14.2803 7 14.7143C7 15.1482 7.33579 15.5 7.75 15.5H16.25C16.6642 15.5 17 15.1482 17 14.7143Z"
          fill="currentColor"
        />
      </svg>
    );
  }
);

AlignRightIcon.displayName = 'AlignRightIcon';
