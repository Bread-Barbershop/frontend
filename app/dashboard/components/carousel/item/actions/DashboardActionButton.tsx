import { dashboardCarouselLayout } from '../../carouselLayout';

import type {
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
  SVGProps,
} from 'react';

type DashboardActionButtonVariant = 'kakao' | 'url' | 'outline';

type DashboardActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> & {
  children: ReactNode;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  variant: DashboardActionButtonVariant;
};

const variantClassName: Record<DashboardActionButtonVariant, string> = {
  kakao: 'bg-[#FAE100] text-[#3C1E1E] hover:bg-[#F5DC00]',
  url: 'bg-[#121212] text-white hover:bg-[#202020]',
  outline:
    'border border-[#EAEAEA] bg-white text-[#121212] hover:bg-[#F7F7F7]',
};

function DashboardActionButton({
  children,
  icon: Icon,
  variant,
  className = '',
  disabled,
  onClick,
  ...props
}: DashboardActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={event => {
        event.stopPropagation();
        if (disabled) return;
        onClick?.(event);
      }}
      className={`grid select-none grid-cols-[32px_1fr_32px] items-center rounded-lg px-2 py-1.5 font-pretendard text-[14px] font-semibold leading-5 transition-colors ${
        variantClassName[variant]
      } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${className}`}
      style={{
        flex: '0 0 auto',
        width: dashboardCarouselLayout.primaryActionWidth,
        minWidth: dashboardCarouselLayout.primaryActionWidth,
        maxWidth: dashboardCarouselLayout.primaryActionWidth,
        height: dashboardCarouselLayout.primaryActionHeight,
      }}
      {...props}
    >
      <Icon className="h-8 w-8" aria-hidden="true" />
      <span className="justify-self-center">{children}</span>
      <span aria-hidden="true" />
    </button>
  );
}

export default DashboardActionButton;
