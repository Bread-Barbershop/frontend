'use client';

import { EllipsisVertical } from 'lucide-react';
import {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/utils/cn';

type MenuPlacement = 'bottom-start' | 'bottom-end';

interface ActionMenuButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  menu: ReactNode;
  icon?: ReactNode;
  usePortal?: boolean;
  placement?: MenuPlacement;
  offset?: number;
  wrapperClassName?: string;
  buttonClassName?: string;
  menuClassName?: string;
  menuStyle?: CSSProperties;
}

export function ActionMenuButton({
  isOpen,
  onToggle,
  onClose,
  menu,
  icon,
  usePortal = true,
  placement = 'bottom-end',
  offset = 4,
  wrapperClassName,
  buttonClassName,
  menuClassName,
  menuStyle,
  className,
  onClick,
  type = 'button',
  ...props
}: ActionMenuButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [portalPosition, setPortalPosition] = useState({
    top: 0,
    left: 0,
  });

  const updatePortalPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setPortalPosition({
      top: rect.bottom + offset,
      left: placement === 'bottom-end' ? rect.right : rect.left,
    });
  }, [offset, placement]);

  useEffect(() => {
    if (!isOpen) return;

    updatePortalPosition();
    window.addEventListener('resize', updatePortalPosition);
    window.addEventListener('scroll', updatePortalPosition, true);

    return () => {
      window.removeEventListener('resize', updatePortalPosition);
      window.removeEventListener('scroll', updatePortalPosition, true);
    };
  }, [isOpen, updatePortalPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const menuNode = isOpen ? (
    <div
      ref={menuRef}
      className={cn(
        usePortal
          ? 'fixed z-[9999]'
          : 'absolute right-0 top-[calc(100%+4px)] z-10',
        menuClassName
      )}
      style={
        usePortal
          ? {
              top: portalPosition.top,
              left: portalPosition.left,
              transform:
                placement === 'bottom-end'
                  ? 'translateX(-100%)'
                  : undefined,
              ...menuStyle,
            }
          : menuStyle
      }
      onClick={event => event.stopPropagation()}
    >
      {menu}
    </div>
  ) : null;

  return (
    <div className={cn('relative', wrapperClassName)}>
      <button
        ref={buttonRef}
        type={type}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-btn-hover active:bg-btn-pressed',
          buttonClassName,
          className
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={event => {
          event.stopPropagation();
          updatePortalPosition();
          onClick?.(event);
          onToggle();
        }}
        {...props}
      >
        {icon ?? <EllipsisVertical className="size-6 text-black" />}
      </button>

      {usePortal && typeof document !== 'undefined'
        ? createPortal(menuNode, document.body)
        : menuNode}
    </div>
  );
}
