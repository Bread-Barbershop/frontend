import { VariantProps } from 'class-variance-authority';
import {
  CheckCircleIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import { toastBarVariants } from './ToastBar.style';

interface ToastBarProps extends VariantProps<typeof toastBarVariants> {
  message: string;
}

const toastBarIcons = {
  success: <CheckCircleIcon size={20} />,
  error: <CircleXIcon size={20} />,
  warning: <TriangleAlertIcon size={20} />,
  info: <InfoIcon size={20} />,
};

export const ToastBar = ({ variant = 'success', message }: ToastBarProps) => {
  return (
    <div className={toastBarVariants({ variant })}>
      <div className="absolute left-2">{variant && toastBarIcons[variant]}</div>
      {message}
    </div>
  );
};
