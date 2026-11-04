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
  threshold = 0,
  rootMargin = '0px 0px -40px 0px',
  delayMs = 0,
  style,
  ...rest
}: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersected, setIsIntersected] = useState(false);
  const [isTransitionDone, setIsTransitionDone] = useState(false);

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

  // 애니메이션 바이패스 대상이거나 뷰포트에 도달한 경우 노출
  const isVisible = shouldBypassAnimation || isIntersected;

  return (
    <div
      ref={ref}
      onTransitionEnd={event => {
        // 자식 요소의 transition 버블링 방지 및 opacity/transform 전환 완료 시 will-change 해제
        if (event.target !== event.currentTarget) return;
        if (
          !event.propertyName ||
          event.propertyName === 'opacity' ||
          event.propertyName === 'transform'
        ) {
          if (isVisible) {
            setIsTransitionDone(true);
          }
        }
      }}
      className={cn(
        'scroll-fade-in-item w-full transition-all duration-700 ease-out',
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
      <noscript>
        <style>{`
          .scroll-fade-in-item {
            opacity: 1 !important;
            transform: none !important;
          }
        `}</style>
      </noscript>
      {children}
    </div>
  );
}

export default ScrollFadeIn;
