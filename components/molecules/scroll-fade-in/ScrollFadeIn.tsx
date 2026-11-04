'use client';

import React, { HTMLAttributes, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/utils/cn';

export interface ScrollFadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  delayMs?: number;
}

export function ScrollFadeIn({
  children,
  className,
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  delayMs = 0,
  style,
  ...rest
}: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        'w-full transition-all duration-700 ease-out will-change-[opacity,transform]',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className
      )}
      style={{
        ...style,
        ...(delayMs > 0 && isVisible ? { transitionDelay: `${delayMs}ms` } : {}),
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default ScrollFadeIn;
