import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const FontColorIcon = React.forwardRef<SVGSVGElement, IconProps>(
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
        <path d="M13.2238 19.428H10.7993L14.5558 9H17.4442L21.1857 19.428H18.7762L17.968 17.0226H14.0469L13.2238 19.428ZM14.6156 15.3374H17.3993L16.0374 11.3477H15.9626L14.6156 15.3374Z" />
        <path d="M10.5 21.6461H21.5V23H10.5V21.6461Z" />
      </svg>
    );
  }
);

FontColorIcon.displayName = 'FontColorIcon';
