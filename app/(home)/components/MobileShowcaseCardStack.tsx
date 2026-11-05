'use client';

import {
  animate,
  motion,
  type MotionValue,
  type Transition,
  useMotionValue,
} from 'framer-motion';
import Image, { StaticImageData } from 'next/image';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type CardData = {
  id: string;
  image: StaticImageData;
  alt: string;
};

type StackOffset = {
  x: number;
  y: number;
  rotate: number;
};

type CardMotionTarget = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
};

type StackCardProps = {
  card: CardData;
  stackPosition: number;
  stackSize: number;
  swipeCycle: number;
  isTop: boolean;
  isLocked: boolean;
  offset: StackOffset;
  nextOffset: StackOffset | null;
  topDragX: MotionValue<number>;
  onSwipeStart: () => void;
  onSwipeComplete: () => void;
};

const STACK_OFFSETS: StackOffset[] = [
  { x: 0, y: 0, rotate: 0 },
  { x: 0, y: 0, rotate: 2.5 },
  { x: 0, y: 0, rotate: -2.5 },
];

const SWIPE_THRESHOLD = 90;
const MIN_FLY_OUT_X = 520;
const DRAG_ROTATION_FACTOR = 0.06;
const FLY_OUT_MS = 320;
const FLY_OUT_TRANSITION: Transition = {
  duration: FLY_OUT_MS / 1000,
  ease: [0.22, 1, 0.36, 1],
};
const CARD_STACK_STYLE = {
  '--mobile-card-height':
    'clamp(220px, calc(var(--mobile-home-viewport-height, 100vh) - 293px), 397px)',
} as CSSProperties;
const CARD_IMAGE_SIZES = '196px';
const SPRING_BACK_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 360,
  damping: 30,
};

function getFlyOutX() {
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth;

  return Math.max(MIN_FLY_OUT_X, viewportWidth / 2 + 260);
}

function StackCard({
  card,
  stackPosition,
  stackSize,
  swipeCycle,
  isTop,
  isLocked,
  offset,
  nextOffset,
  topDragX,
  onSwipeStart,
  onSwipeComplete,
}: StackCardProps) {
  const x = useMotionValue(offset.x);
  const y = useMotionValue(offset.y);
  const baseRotate = useMotionValue(offset.rotate);
  const preparedRotate = useMotionValue(offset.rotate);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);
  const activeAnimationsRef = useRef<Array<{ stop: () => void }>>([]);
  const flyOutTimeoutRef = useRef<number | null>(null);
  const isFlyingOutRef = useRef(false);
  const hasCompletedFlyOut = useRef(false);
  const previousStackPositionRef = useRef(stackPosition);
  const previousSwipeCycleRef = useRef(swipeCycle);

  const rotate = isTop ? baseRotate : preparedRotate;

  const updatePreparedRotate = useCallback(
    (dragX: number) => {
      if (isTop || !nextOffset) return;

      const progress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
      const current = baseRotate.get();

      preparedRotate.set(
        current + (nextOffset.rotate - current) * progress
      );
    },
    [baseRotate, isTop, nextOffset, preparedRotate]
  );

  useEffect(() => {
    return topDragX.on('change', updatePreparedRotate);
  }, [topDragX, updatePreparedRotate]);

  const stopActiveAnimations = useCallback(() => {
    activeAnimationsRef.current.forEach(animation => animation.stop());
    activeAnimationsRef.current = [];
  }, []);

  const animateTo = useCallback(
    (target: CardMotionTarget, transition: Transition) => {
      stopActiveAnimations();
      activeAnimationsRef.current = [
        animate(x, target.x, transition),
        animate(y, target.y, transition),
        animate(baseRotate, target.rotate, transition),
        animate(scale, target.scale, transition),
        animate(opacity, target.opacity, transition),
      ];
    },
    [opacity, baseRotate, scale, stopActiveAnimations, x, y]
  );

  useLayoutEffect(() => {
    const positionChanged =
      previousStackPositionRef.current !== stackPosition;
    const cycleChanged = previousSwipeCycleRef.current !== swipeCycle;

    previousStackPositionRef.current = stackPosition;
    previousSwipeCycleRef.current = swipeCycle;

    if (!positionChanged && !cycleChanged) return;

    stopActiveAnimations();

    if (flyOutTimeoutRef.current !== null) {
      window.clearTimeout(flyOutTimeoutRef.current);
      flyOutTimeoutRef.current = null;
    }

    isFlyingOutRef.current = false;
    hasCompletedFlyOut.current = false;
    x.set(offset.x);
    y.set(offset.y);
    baseRotate.set(offset.rotate);
    preparedRotate.set(offset.rotate);
    scale.set(1);
    opacity.set(1);
  }, [
    baseRotate,
    offset.rotate,
    offset.x,
    offset.y,
    opacity,
    preparedRotate,
    scale,
    stackPosition,
    stopActiveAnimations,
    swipeCycle,
    x,
    y,
  ]);

  useEffect(() => {
    return () => {
      stopActiveAnimations();

      if (flyOutTimeoutRef.current !== null) {
        window.clearTimeout(flyOutTimeoutRef.current);
        flyOutTimeoutRef.current = null;
      }
    };
  }, [stopActiveAnimations]);

  const triggerFlyOut = (direction: 1 | -1) => {
    if (!isTop || isLocked || isFlyingOutRef.current) {
      return;
    }

    isFlyingOutRef.current = true;
    hasCompletedFlyOut.current = false;
    onSwipeStart();

    // Push topDragX to threshold so back cards fully transition to their next pose
    topDragX.set(direction * SWIPE_THRESHOLD);

    animateTo(
      {
        x: direction * getFlyOutX(),
        y: offset.y,
        rotate: direction * 35,
        scale: 0.92,
        opacity: 0,
      },
      FLY_OUT_TRANSITION
    );

    flyOutTimeoutRef.current = window.setTimeout(() => {
      if (hasCompletedFlyOut.current) return;

      hasCompletedFlyOut.current = true;
      onSwipeComplete();
    }, FLY_OUT_MS);
  };

  const handleDragStart = () => {
    if (!isTop || isLocked || isFlyingOutRef.current) return;

    stopActiveAnimations();
    topDragX.set(0);
  };

  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    if (!isTop || isLocked || isFlyingOutRef.current) return;

    baseRotate.set(offset.rotate + info.offset.x * DRAG_ROTATION_FACTOR);
    topDragX.set(info.offset.x);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    if (!isTop || isLocked || isFlyingOutRef.current) return;

    if (Math.abs(info.offset.x) >= SWIPE_THRESHOLD) {
      triggerFlyOut(info.offset.x > 0 ? 1 : -1);
      return;
    }

    // Spring back: reset drag tracking so back cards revert smoothly
    animateTo(
      {
        x: offset.x,
        y: offset.y,
        rotate: offset.rotate,
        scale: 1,
        opacity: 1,
      },
      SPRING_BACK_TRANSITION
    );
    activeAnimationsRef.current.push(
      animate(topDragX, 0, SPRING_BACK_TRANSITION)
    );
  };

  return (
    <motion.div
      data-card-id={card.id}
      data-stack-position={stackPosition}
      className={`absolute left-0 top-0 h-full w-full select-none overflow-hidden rounded-[16px] bg-white shadow-[inset_0_1px_2px_0_rgb(0_0_0_/_4%),0_1px_4px_0_rgb(0_0_0_/_8%),0_8px_24px_0_rgb(0_0_0_/_10%)] ${
        isTop && !isLocked ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        zIndex: stackSize - stackPosition,
        touchAction: isTop ? 'none' : 'auto',
        willChange: 'transform, opacity',
      }}
      drag={isTop && !isLocked ? 'x' : false}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      aria-hidden={!isTop}
    >
      <Image
        src={card.image}
        alt={card.alt}
        fill
        sizes={CARD_IMAGE_SIZES}
        className="pointer-events-none object-cover"
        draggable={false}
        priority={stackPosition === 0}
      />
    </motion.div>
  );
}

function createInitialOrder(length: number) {
  return Array.from({ length }, (_, index) => index);
}

export function MobileShowcaseCardStack({ cards }: { cards: CardData[] }) {
  const [order, setOrder] = useState(() => createInitialOrder(cards.length));
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeCycle, setSwipeCycle] = useState(0);
  const topDragX = useMotionValue(0);

  const visibleOrder = useMemo(
    () => order.slice(0, Math.min(order.length, STACK_OFFSETS.length)),
    [order]
  );

  useLayoutEffect(() => {
    topDragX.set(0);
  }, [swipeCycle, topDragX]);

  if (cards.length === 0) return null;

  const handleSwipeComplete = () => {
    setOrder(currentOrder => {
      if (currentOrder.length === 0) return currentOrder;

      const [movedIndex, ...rest] = currentOrder;
      return [...rest, movedIndex];
    });
    setSwipeCycle(cycle => cycle + 1);
    setIsAnimating(false);
  };

  return (
    <div
      className="relative mt-[23px] h-[var(--mobile-card-height)] w-screen touch-none overflow-visible"
      style={CARD_STACK_STYLE}
      aria-label="초대장 쇼케이스 카드"
    >
      <div className="absolute left-1/2 top-0 h-full max-w-[196px] -translate-x-1/2 aspect-[196/397]">
        {/* TODO: add non-drag previous/next controls if an accessible fallback is required. */}
        {visibleOrder.map((cardIndex, stackPosition) => {
          const card = cards[cardIndex];
          if (!card) return null;

          const isTop = stackPosition === 0;

          // The offset this card will move to when the top card is swiped away
          const nextOffset =
            stackPosition > 0
              ? STACK_OFFSETS[stackPosition - 1] ?? null
              : null;

          return (
            <StackCard
              key={card.id}
              card={card}
              stackPosition={stackPosition}
              stackSize={visibleOrder.length}
              swipeCycle={swipeCycle}
              isTop={isTop}
              isLocked={isAnimating}
              offset={STACK_OFFSETS[stackPosition] ?? STACK_OFFSETS.at(-1)!}
              nextOffset={nextOffset}
              topDragX={topDragX}
              onSwipeStart={() => setIsAnimating(true)}
              onSwipeComplete={handleSwipeComplete}
            />
          );
        })}
      </div>
    </div>
  );
}
