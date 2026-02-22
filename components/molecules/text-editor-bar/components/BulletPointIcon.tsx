import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const BulletPointIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 20, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 20 20"
        width={size}
        height={size}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path d="M5.69231 14C5.69231 13.4477 6.10558 13 6.61538 13H17.0769C17.5867 13 18 13.4477 18 14C18 14.5523 17.5867 15 17.0769 15H6.61538C6.10558 15 5.69231 14.5523 5.69231 14Z" />
        <path d="M5.69231 10C5.69231 9.44772 6.10558 9 6.61538 9H17.0769C17.5867 9 18 9.44772 18 10C18 10.5523 17.5867 11 17.0769 11H6.61538C6.10558 11 5.69231 10.5523 5.69231 10Z" />
        <path d="M5.69231 6C5.69231 5.44772 6.10558 5 6.61538 5H17.0769C17.5867 5 18 5.44772 18 6C18 6.55228 17.5867 7 17.0769 7H6.61538C6.10558 7 5.69231 6.55228 5.69231 6Z" />
        <path d="M3.84615 14C3.84615 14.5523 3.43288 15 2.92308 15C2.41328 15 2 14.5523 2 14C2 13.4477 2.41328 13 2.92308 13C3.43288 13 3.84615 13.4477 3.84615 14Z" />
        <path d="M3.84615 10C3.84615 10.5523 3.43288 11 2.92308 11C2.41328 11 2 10.5523 2 10C2 9.44772 2.41328 9 2.92308 9C3.43288 9 3.84615 9.44772 3.84615 10Z" />
        <path d="M3.84615 6C3.84615 6.55228 3.43288 7 2.92308 7C2.41328 7 2 6.55228 2 6C2 5.44772 2.41328 5 2.92308 5C3.43288 5 3.84615 5.44772 3.84615 6Z" />
      </svg>
    );
  }
);

BulletPointIcon.displayName = 'BulletPointIcon';
