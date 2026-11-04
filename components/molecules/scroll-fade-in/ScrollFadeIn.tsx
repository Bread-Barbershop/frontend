'use client';

import React, { HTMLAttributes, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { usePrefersReducedMotion } from '@/components/organisms/gallery/hooks/usePrefersReducedMotion';
import { cn } from '@/shared/utils/cn';

export interface ScrollFadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  delayMs?: number;
}

const emptySubscribe = () => () => {};

function getObserverSupported(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
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
  const [isIntersected, setIsIntersected] = useState(false);
  const [isTransitionDone, setIsTransitionDone] = useState(false);

  // SSR 점진적 향상(Progressive Enhancement): 서버 스냅샷에서는 가시화하여 JS 미실행 시에도 콘텐츠를 보장
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isObserverSupported = useSyncExternalStore(
    emptySubscribe,
    getObserverSupported,
    () => true
  );
  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldBypassAnimation = !isObserverSupported || prefersReducedMotion;

  useEffect(() => {
    if (shouldBypassAnimation) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsIntersected(true);
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
  }, [shouldBypassAnimation, threshold, rootMargin]);

  // SSR이거나 애니메이션 바이패스 대상이거나 뷰포트에 도달한 경우 노출
  const isVisible = !isHydrated || shouldBypassAnimation || isIntersected;

  return (
    <div
      ref={ref}
      onTransitionEnd={() => {
        if (isVisible) {
          setIsTransitionDone(true);
        }
      }}
      className={cn(
        'w-full transition-all duration-700 ease-out',
        !isTransitionDone && !shouldBypassAnimation && 'will-change-[opacity,transform]',
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
