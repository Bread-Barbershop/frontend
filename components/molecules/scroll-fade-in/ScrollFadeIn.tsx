'use client';

import React, {
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { usePrefersReducedMotion } from '@/components/organisms/gallery/hooks/usePrefersReducedMotion';
import { cn } from '@/shared/utils/cn';
import {
  boundedMotionNumber,
  MOTION_EASINGS,
  resolveMotionEasing,
  type MotionEasing,
} from '@/shared/utils/motionSettings';

import type { ScrollAnimationType, ScrollTriggerMode } from './animationConfig';

export interface ScrollFadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  delayMs?: number;
  animationType?: ScrollAnimationType;
  triggerMode?: ScrollTriggerMode;
  animationDurationMs?: number;
  animationEasing?: MotionEasing;
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
  animationType = 'fade-up',
  triggerMode = 'down-only',
  animationDurationMs = 700,
  animationEasing = 'natural',
  style,
  ...rest
}: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'visible'>(
    'hidden'
  );

  const isObserverSupported = useSyncExternalStore(
    emptySubscribe,
    getObserverSupported,
    () => true
  );
  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldBypassAnimation =
    !isObserverSupported || prefersReducedMotion || animationType === 'none';

  useEffect(() => {
    if (shouldBypassAnimation) return;

    const element = ref.current;
    if (!element) return;

    // Editor preview scrolls inside a panel, while guest pages may scroll the window.
    let scrollParent = element.parentElement;
    while (scrollParent) {
      const overflowY = window.getComputedStyle(scrollParent).overflowY;
      if (/(auto|scroll)/.test(overflowY)) break;
      scrollParent = scrollParent.parentElement;
    }

    let aboveViewport = false;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            aboveViewport =
              entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0);
            // Keep one-way content visible when scrolling back up to it.
            setPhase(
              aboveViewport && triggerMode !== 'both' ? 'visible' : 'hidden'
            );
            continue;
          }
          if (aboveViewport && triggerMode !== 'both') continue;
          setPhase('entering');
          if (triggerMode === 'down-only') {
            observer.unobserve(element);
            break;
          }
        }
      },
      {
        root: scrollParent,
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldBypassAnimation, threshold, rootMargin, triggerMode]);

  const isVisible = shouldBypassAnimation || phase !== 'hidden';
  const isEntering = !shouldBypassAnimation && phase === 'entering';

  return (
    // Observe a stationary box so the reveal transform cannot trigger another entry.
    <div ref={ref} className="w-full">
      <div
        onTransitionEnd={event => {
          // 자식 요소의 transition 버블링 방지 및 opacity/transform 전환 완료 시 will-change 해제
          if (event.target !== event.currentTarget) return;
          if (
            !event.propertyName ||
            event.propertyName === 'opacity' ||
            event.propertyName === 'transform'
          ) {
            if (isEntering) {
              setPhase('visible');
            }
          }
        }}
        className={cn(
          'scroll-fade-in-item w-full transition-all duration-700 ease-out',
          phase !== 'visible' &&
            !shouldBypassAnimation &&
            'will-change-[opacity,transform]',
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : animationType === 'fade-down'
              ? 'opacity-0 -translate-y-6'
              : animationType === 'fade'
                ? 'opacity-0'
                : animationType === 'zoom-in'
                  ? 'opacity-0 scale-95'
                  : 'opacity-0 translate-y-6',
          className
        )}
        style={{
          transitionDuration: isEntering
            ? `${boundedMotionNumber(animationDurationMs, 200, 2000, 700)}ms`
            : '0ms',
          transitionTimingFunction:
            MOTION_EASINGS[resolveMotionEasing(animationEasing)],
          ...style,
          ...(delayMs > 0 && isEntering
            ? { transitionDelay: `${delayMs}ms` }
            : {}),
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
    </div>
  );
}

export default ScrollFadeIn;
