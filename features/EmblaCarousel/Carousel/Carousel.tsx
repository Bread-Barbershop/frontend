import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useEffect } from 'react';

import { cn } from '@/shared/utils/cn';

import NextButton from '../CarouselButton/NextButton';
import PrevButton from '../CarouselButton/PrevButton';

// Embla Carousel 기본 옵션 + 한글 설명{
// 캐러셀 활성화 여부
// false로 하면 Embla 로직 자체가 동작하지 않음
// active: true,

// 슬라이드가 스냅될 기준 위치
// 'start' | 'center' | 'end'
// 리스트/편집기형 UI면 'start' 추천
// align: 'center',

// 스크롤 방향
// 'x' = 가로, 'y' = 세로
// axis: 'x',

// 반응형 옵션 오버라이드
// CSS 미디어쿼리 문자열 기준
// 슬라이드 개수는 CSS(Tailwind)로 제어해야 함
// breakpoints: {},

// 슬라이드 컨테이너 직접 지정
// React에선 ref로 자동 처리되므로 거의 사용 안 함
// container: null,

// 양 끝 스크롤 제어 방식
// 'trimSnaps' : 끝에 남는 여백 제거 (기본값)
// 'keepSnaps' : 모든 스냅 유지
// false        : 제한 없음
// containScroll: 'trimSnaps',

// 문서 진행 방향
// 'ltr' | 'rtl'
// 아랍어/히브리어 환경 아니면 거의 안 씀
// direction: 'ltr',

// 스냅 없이 자유 스크롤 여부
// true면 iOS 리스트 같은 느낌
// dragFree: false,

// 마우스/터치 드래그 가능 여부
// dnd-kit과 충돌 시 drag 중에 false로 제어하기도 함
// draggable: true,

// 드래그로 인식되는 최소 이동 거리(px)
// 클릭과 드래그 구분용
// dragThreshold: 10,

// 스크롤 애니메이션 지속 시간
// 숫자가 클수록 느림
// duration: 25,

// 포커스 시 자동으로 해당 슬라이드로 이동
// 키보드 접근성(A11y)에 중요
// focus: true,

// 슬라이드가 "보인다"고 판단하는 비율
// 0 = 조금만 보여도 inView
// 1 = 완전히 보여야 inView
// inViewThreshold: 0,

// inView 계산 시 여유 margin
// IntersectionObserver margin 개념
// inViewMargin: '0px',

// 무한 루프 여부
// 순서가 중요한 리스트(dnd-kit)에서는 사용 비추천
// loop: false,

// resize 시 자동 재계산
// 거의 항상 true 유지
// resize: true,

// 빠르게 드래그 시 스냅을 건너뛸 수 있게 함
// true면 여러 슬라이드가 한 번에 넘어갈 수 있음
// skipSnaps: false,

// 슬라이드 DOM 변경 시 자동 reInit
// 동적 리스트면 true 유지 필수
// slideChanges: true,

// 슬라이드 요소 직접 지정
// React 환경에선 거의 사용 안 함
// slides: null,

// 한 번에 이동할 슬라이드 개수
// Next 버튼 클릭 시 몇 개씩 이동할지
// slidesToScroll: 1,

// 서버 사이드 렌더링 대응 옵션
// 일반적인 Next.js App Router에선 거의 건드릴 일 없음
// ssr: [],

// 시작 슬라이드 index
// 편집기 복원, 상태 유지에 유용
// startSnap: 0,
// };
interface Props {
  options?: EmblaOptionsType;
  children?: React.ReactNode;
  className?: string;
  carouselClassName?: string;
  isButtonShow?: boolean;
  buttonClassName?: string;
  onScroll?: (emblaApi: EmblaCarouselType) => void;
}

function Carousel({
  options,
  children,
  className,
  carouselClassName,
  isButtonShow,
  buttonClassName,
  onScroll,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  useEffect(() => {
    if (!emblaApi || !onScroll) return;

    const scrollHandler = () => onScroll(emblaApi);

    emblaApi.on('scroll', scrollHandler);
    emblaApi.on('reInit', scrollHandler);

    onScroll(emblaApi);

    return () => {
      emblaApi.off('scroll', scrollHandler);
      emblaApi.off('reInit', scrollHandler);
    };
  }, [emblaApi, onScroll]);

  const goToPrev = () => emblaApi?.scrollPrev();
  const goToNext = () => emblaApi?.scrollNext();
  return (
    <div className={cn('w-full h-full', className)}>
      <div className="overflow-hidden h-full relative" ref={emblaRef}>
        <div
          className={cn(
            `flex touch-pan-y touch-pinch-zoom w-full h-full py-10`,
            carouselClassName
          )}
        >
          {children}
        </div>
      </div>
      {isButtonShow && (
        <div className={cn('flex', buttonClassName)}>
          <PrevButton onClick={goToPrev} />
          <NextButton onClick={goToNext} />
        </div>
      )}
    </div>
  );
}

export default Carousel;
