import { VariantProps } from 'class-variance-authority';

import SuccessIcon from '@/shared/assets/icons/check.svg';
import ErrorIcon from '@/shared/assets/icons/error.svg';
import InfoIcon from '@/shared/assets/icons/Info.svg';
import WarningIcon from '@/shared/assets/icons/warning.svg';

import { toastBarVariants } from './ToastBar.style';

interface ToastBarProps extends VariantProps<typeof toastBarVariants> {
  message: string;
}

const toastBarIcons = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

export const ToastBar = ({ variant = 'success', message }: ToastBarProps) => {
  const currentVariant = variant ?? 'success';

  return (
    <div className={toastBarVariants({ variant: currentVariant })}>
      <div className="absolute left-2 flex size-6 items-center justify-center">
        {toastBarIcons[currentVariant]}
      </div>
      <span className="whitespace-nowrap text-center">{message}</span>
    </div>
  );
};
