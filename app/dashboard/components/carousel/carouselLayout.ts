import { CSSProperties } from 'react';

const carouselCardHeight = '520px';

export const dashboardCarouselLayout = {
  // 대시보드 셸 내부에서 캐러셀이 차지하는 전체 높이
  stageHeight: '75%',
  dashboardStageHeight: '82%',
  // 캐러셀 전체 트랙이 아래로 얼마나 묻혀 보일지 결정하는 값
  buriedOffset: '21rem',
  // 선택된 카드가 기본 위치에서 위로 얼마나 떠오를지 결정하는 값
  selectedLift: '20rem',
  dashboardSelectedLift: '16.5rem',
  // 떠오른 카드와 헤더가 위쪽에서 잘리지 않도록 확보하는 여백
  safeTop: '3rem',
  // 아래쪽에 묻힌 카드가 답답해 보이지 않도록 확보하는 여백
  safeBottom: '3rem',
  // 하단 컨트롤 바와 카드 영역 사이에 추가로 확보하는 간격
  controllerClearance: '2.5rem',
  // 하단 글래스모피즘 컨트롤 바 높이
  controllerHeight: '65px',
  // 카드 사이 가로 간격
  trackGap: '50px',
  // 카드가 위로 떠오를 때의 애니메이션 시간
  cardLiftDurationMs: 600,
  // 카드 본체와 헤더가 함께 사용하는 공통 카드 크기
  cardWidth: '260px',
  cardHeight: carouselCardHeight,
  // 선택된 카드 위에 붙는 헤더 높이
  headerHeight: '44px',
  // 선택 상태에서 헤더와 카드가 합쳐졌을 때의 전체 시각 높이
  selectedVisualHeight: `calc(${carouselCardHeight} + 44px)`,
  // 선택된 카드 우측 상단 액션 버튼 묶음 위치 보정값
  actionTop: '36px',
  actionRight: '-24px',
  // 카드 중앙 액션 버튼 묶음 사이 간격
  centerActionGap: '8px',
  centerActionBottomPadding: '40px',
  // 카드 우측 상단 액션 버튼 묶음 사이 간격
  sideActionGap: '8px',
  // 중앙 액션 버튼 공통 크기
  primaryActionWidth: '220px',
  primaryActionHeight: '44px',
  // 우측 상단 작은 액션 버튼 공통 크기
  sideActionSize: '32px',
  // 우측 상단 아이콘 크기
  sideActionIconSize: 20,
  // 우측 상단 작은 액션 버튼 그림자
  sideActionShadow:
    '0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.08)',
  // 중앙 액션 내부 가로 패딩
  primaryActionPaddingX: '8px',
  // 중앙 액션 내부 링크/복사 버튼 패딩
  primaryActionInnerPaddingX: '4px',
} as const;

export const dashboardCarouselVars = {
  '--carousel-base-offset': dashboardCarouselLayout.buriedOffset,
  '--carousel-track-offset': dashboardCarouselLayout.selectedLift,
  '--carousel-safe-top': dashboardCarouselLayout.safeTop,
  '--carousel-safe-bottom': dashboardCarouselLayout.safeBottom,
} as CSSProperties;
