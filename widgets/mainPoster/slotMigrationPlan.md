# Slot Migration Plan

## 목적

슬롯 구조를 `Fabric object 중심`에서 `SlotEntity 중심`으로 전환하되, 기존에 생성된 JSON 데이터와 편집 흐름을 깨지 않도록 단계적으로 이전한다.

이 문서는 아래를 고정한다.

- 목표 구조
- 기존 JSON 호환 전략
- 버전 및 마이그레이션 전략
- 단계별 구현 범위
- 영향 파일
- 레거시 제거 시점

## 현재 구조 요약

현재 슬롯은 별도 엔티티가 아니라 Fabric 객체 내부 메타로 표현된다.

- 빈 슬롯: `Rect + slot`
- 채워진 슬롯: `FabricImage + slot`
- 프레임 상태:
  - `slotFrameWidth`
  - `slotFrameHeight`
  - `slotFrameLeft`
  - `slotFrameTop`
  - `slotFrameAngle`
- 이미지 상태:
  - `slotImageBaseScale`
  - `slotZoomScale`
  - `slotImageOffsetX`
  - `slotImageOffsetY`

현재 JSON 저장도 위 필드들에 직접 의존한다.

## 목표 구조

목표는 슬롯을 화면 객체가 아니라 도메인 엔티티로 다루는 것이다.

```ts
type SlotId = string;

type SlotFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
};

type SlotImageTransform = {
  baseScale: number;
  zoomScale: number;
  offsetX: number;
  offsetY: number;
};

type SlotEntity = {
  slotId: SlotId;
  meta: ImageSlotMeta;
  frame: SlotFrame;
  image: SlotImageTransform;
  frameObjectId?: string;
  imageObjectId?: string;
};
```

중요한 점:

- UI와 편집 로직은 가능하면 `SlotEntity`를 기준으로 동작한다.
- Fabric object는 렌더링 대상이자 입출력 어댑터 역할만 맡는다.
- 실제 1오브젝트 유지 여부와 2오브젝트 전환 여부는 나중에 결정한다.

## 핵심 원칙

### 1. 초기 전환에서는 JSON 스키마를 깨지 않는다

초기 단계에서는 기존 JSON 필드 구조를 유지한다.

- 로드 시:
  - 기존 JSON 객체에서 슬롯 관련 필드를 읽는다.
  - 내부에서 `SlotEntity`로 재구성한다.
- 저장 시:
  - 당분간 기존 슬롯 필드로 다시 직렬화한다.

즉, 내부 구조는 바뀌어도 외부 JSON 포맷은 유지한다.

### 2. 도메인 상태와 런타임 상태를 분리한다

도메인 상태:

- `slot`
- `slotFrame*`
- `slotImage*`
- `isLocked`

런타임 상태:

- 이벤트 핸들러 참조
- 원본 메서드 백업
- 드래그 중간 좌표
- patch 여부

런타임 상태는 Fabric object에 `__...` 필드로 계속 늘리지 않고 `WeakMap` 기반 runtime 저장소로 이동한다.

### 3. 슬롯 조작은 API를 통해서만 수행한다

직접 Fabric object 필드를 수정하는 대신 슬롯 API를 만든다.

예시:

- `getSlotEntity(...)`
- `replaceSlotImage(...)`
- `restoreSlotPlaceholder(...)`
- `updateSlotImageTransform(...)`
- `resizeSlotFrame(...)`
- `applySlotRender(...)`

## 마이그레이션 전략

## 버전 정책

초기에는 JSON에 새 버전 필드를 강제하지 않는다.

대신 내부적으로 다음 두 경로를 지원한다.

- `legacy object fields -> SlotEntity`
- `SlotEntity -> legacy object fields`

나중에 저장 포맷을 바꾸는 시점에만 `version` 도입을 검토한다.

권장 시점:

- 1차~3차: 버전 필드 없이 기존 포맷 유지
- 4차 이후: 새 포맷 필요성이 충분할 때만 `version: 2` 도입 검토

## 로드 전략

로드 시 처리 순서:

1. Fabric object 로드
2. 슬롯 관련 object 탐색
3. object의 `slot`, `slotFrame*`, `slotImage*`를 읽어 `SlotEntity` 생성
4. `SlotEntity`를 기준으로 슬롯 runtime 재구성
5. 필요한 patch, control, hit area, clipPath 적용

이때 기존 JSON에는 별도 마이그레이션 파일이 없어도 동작해야 한다.

## 저장 전략

저장 시 처리 순서:

1. 현재 슬롯 상태를 `SlotEntity`에서 읽음
2. 저장 대상 Fabric object에 legacy 슬롯 필드 반영
3. 기존 `canvas.toObject(...)` 흐름으로 저장

즉 내부 source of truth는 점차 `SlotEntity`로 옮기되, 저장 포맷은 기존 object field 기반을 유지한다.

## 레거시 지원 범위

### 빨리 없애도 되는 것

- `useFabricSlot.tsx` 내부의 직접 필드 조작 분기
- `__slotImageModifiedHandler` 같은 object 부착 런타임 필드
- UI에서 `activeObject`를 직접 파고 슬롯 판별하는 코드

### 오래 남겨야 하는 것

- 기존 JSON object field 로더
- `slotFrame*`, `slotImage*` 기반 역직렬화
- 구버전 데이터 fallback

즉, 레거시 구현 코드는 빨리 제거해도 되지만 레거시 데이터 호환은 더 오래 유지한다.

## 단계별 실행 계획

### 0단계. 설계 고정

목표:

- 슬롯 개념과 마이그레이션 규칙 문서화

완료 조건:

- 이 문서 확정
- 프레임 리사이즈 정책 확정
- 가이드라인 기준점 정책 확정

정책:

- 프레임 리사이즈 시 이미지는 자동 확대하지 않음
- 프레임이 커진 만큼 더 보이는 영역만 늘어남
- 스마트 가이드라인 기준은 항상 `frame`

### 1단계. 도메인 타입과 유틸 경계 도입

목표:

- `SlotEntity`와 관련 유틸을 만들고 기존 코드에서 공통 계산을 분리

새 파일 후보:

- `widgets/mainPoster/slot/types.ts`
- `widgets/mainPoster/slot/model.ts`
- `widgets/mainPoster/slot/runtime.ts`
- `widgets/mainPoster/slot/queries.ts`
- `widgets/mainPoster/slot/legacy.ts`

주요 작업:

- 도메인 타입 정의
- object -> SlotEntity 변환기 추가
- SlotEntity -> object field 반영 유틸 추가
- `__...` 런타임 필드 분리를 위한 `WeakMap` 저장소 설계

영향 파일:

- `hooks/useFabricSlot.tsx`
- `utils/imageSlot.ts`
- `types/fabric.ts`

완료 조건:

- 슬롯 계산이 새 유틸을 통해 가능
- 기존 동작 유지
- 저장 포맷 변화 없음

### 2단계. 슬롯 API 계층 도입

목표:

- UI와 이벤트 코드가 Fabric object 대신 슬롯 API를 사용하게 전환

주요 작업:

- `useFabricSlot` 반환 API 재정의
- `TemplateImagePanel`이 `activeObject` 대신 슬롯 엔티티를 읽도록 전환
- 슬롯 업로드/복원/위치/배율 변경이 API 중심으로 이동

핵심 API 후보:

- `getSlotEntityByTarget(target)`
- `getActiveSlotEntity()`
- `replaceSlotImageBySlot(...)`
- `restoreSlotPlaceholderBySlot(...)`
- `updateSlotImageTransformBySlot(...)`
- `resizeSlotFrame(...)`

영향 파일:

- `components/image/TemplateImagePanel.tsx`
- `components/MainPosterPreview.tsx`
- `context/FabricContext.tsx`
- `components/image/ImagePanel.tsx`

완료 조건:

- UI가 더 이상 슬롯 관련 object field를 직접 읽지 않음
- 업로드/복원/편집 흐름이 새 API로 동작
- 기존 JSON은 그대로 로드 가능

### 3단계. 프레임 리사이즈 기능 추가

목표:

- 프레임 자체 크기 조절을 정식 지원

주요 작업:

- `resizeSlotFrame(slotId, nextFrame)` 추가
- 리사이즈 시 `frame`만 우선 변경
- `zoomScale`, `offsetX`, `offsetY` 유지
- `applySlotRender()` 재실행

영향 파일:

- `hooks/useFabricSlot.tsx`
- `hooks/useSetFabricControls.tsx`
- `utils/slotSelectionBorder.ts`

완료 조건:

- 프레임 확대 시 이미지가 억지로 같이 확대되지 않음
- 회전된 프레임에서도 정상 작동
- undo/redo 한 스텝으로 복원 가능

### 4단계. 스마트 가이드라인 frame 기준 전환

목표:

- 슬롯의 가이드라인 기준점을 실제 이미지가 아니라 frame으로 통일

주요 작업:

- 가이드라인용 좌표 공급 함수 도입
- 슬롯은 `frame corners + center`를 기준점으로 사용
- 일반 객체는 기존 흐름 유지

영향 파일:

- `libs/aligning-guidelines.ts`
- `libs/util/collect-line.ts`
- `libs/util/collect-point.ts`

완료 조건:

- 이동 스냅이 frame 기준으로 맞음
- 리사이즈 스냅이 frame 기준으로 맞음
- canvas 중심선 스냅 유지

### 5단계. 실제 2오브젝트 전환 여부 판단

목표:

- 여기서 처음으로 내부 렌더를 2오브젝트로 바꿀지 결정

전환 조건:

- 프레임 자체 스타일이 독립적으로 필요함
- 비사각형/복합 마스크가 본격화됨
- 프레임과 이미지를 독립 제어해야 함

권장:

- 4단계까지는 1오브젝트 유지 가능
- API 경계가 안정된 후에만 2오브젝트 전환

### 6단계. 저장 포맷 버전 전략 재검토

목표:

- 필요 시 `version` 기반 저장 포맷으로 확장

시점:

- 내부 구조와 편집 흐름이 충분히 안정화된 뒤

선택지:

- 기존 object field 포맷 유지
- `version: 2`와 별도 `slots` 구조 도입
- 두 포맷 병행 지원

## 영향 파일 맵

### 도메인/타입

- `widgets/mainPoster/hooks/useFabricSlot.tsx`
- `widgets/mainPoster/utils/imageSlot.ts`
- `widgets/mainPoster/types/fabric.ts`

### UI/선택/패널

- `widgets/mainPoster/components/MainPosterPreview.tsx`
- `widgets/mainPoster/components/image/TemplateImagePanel.tsx`
- `widgets/mainPoster/components/image/ImagePanel.tsx`
- `widgets/mainPoster/components/context-menu/RegisterSlot.tsx`
- `widgets/mainPoster/context/FabricContext.tsx`

### 프레임 기준 선택 표현

- `widgets/mainPoster/utils/slotSelectionBorder.ts`
- `widgets/mainPoster/hooks/useSetFabricControls.tsx`

### 가이드라인

- `widgets/mainPoster/libs/aligning-guidelines.ts`
- `widgets/mainPoster/libs/util/collect-line.ts`
- `widgets/mainPoster/libs/util/collect-point.ts`

### 저장/복원

- `widgets/mainPoster/hooks/useFabric.ts`
- `widgets/mainPoster/components/MainPosterPreview.tsx`

## 검증 체크리스트

### 데이터 호환

- 기존 빈 슬롯 JSON 로드
- 기존 채워진 슬롯 JSON 로드
- 회전된 슬롯 JSON 로드
- 잠긴 슬롯 JSON 로드
- 저장 후 재로드

### 편집 동작

- 빈 슬롯 업로드
- 이미지 교체
- 슬롯 위치 이동
- 슬롯 배율 조절
- 프레임 리사이즈
- 프레임 회전

### UI/상호작용

- 슬롯 클릭 시 패널 진입
- 빈 슬롯 자동 업로드 플로우
- selection border 프레임 기준 표시
- control 위치 프레임 기준 표시
- outside click 해제

### 히스토리

- undo
- redo
- 저장 후 복원
- 복원 직후 clipPath 및 hit area 정상 동작

### 가이드라인

- 이동 스냅
- 리사이즈 스냅
- canvas 중앙 정렬
- 회전 프레임 정렬

## 레거시 제거 기준

레거시 구현 코드는 아래 조건을 모두 만족한 후 삭제한다.

1. 새 슬롯 API가 기본 경로가 되었음
2. 기존 JSON 로드가 새 경로에서 안정적임
3. 프레임 리사이즈와 frame 기준 가이드라인이 모두 동작함
4. 최소 회귀 테스트 세트가 통과함

권장 순서:

- 먼저 레거시 구현 분기 제거
- 나중에 레거시 JSON fallback 제거 여부 판단

즉, 구현 레거시와 데이터 레거시는 같은 시점에 제거하지 않는다.
