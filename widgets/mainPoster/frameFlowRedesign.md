# Main Poster Frame Redesign Flow

이 문서는 `widgets/mainPoster`의 현재 프레임(슬롯) 재설계 구조를 코드 기준으로 정리한 문서입니다.
기존 [frameFlow.md](./frameFlow.md)가 레거시 `slotFrame*`, `slotImage*` 필드 중심의 동작 설명에 가깝다면, 이 문서는 현재 구조를 다음 관점으로 다시 정리합니다.

- 어떤 데이터 모델을 기준으로 프레임을 이해하는지
- 어떤 helper와 query가 진입점 역할을 하는지
- 어떤 이벤트가 어떤 함수 시퀀스를 타는지
- UI가 어떤 API를 통해 슬롯을 조작하는지
- 기존 `frameFlow`와 무엇이 달라졌는지

주요 참조 파일:

- [widgets/mainPoster/slot/types.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/types.ts)
- [widgets/mainPoster/slot/model.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/model.ts)
- [widgets/mainPoster/slot/objectFields.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/objectFields.ts)
- [widgets/mainPoster/slot/frameGeometry.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/frameGeometry.ts)
- [widgets/mainPoster/slot/queries.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/queries.ts)
- [widgets/mainPoster/slot/runtime.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/runtime.ts)
- [widgets/mainPoster/hooks/useFabricSlot.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/hooks/useFabricSlot.tsx)
- [widgets/mainPoster/hooks/useSetFabricControls.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/hooks/useSetFabricControls.tsx)
- [widgets/mainPoster/components/MainPosterPreview.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)
- [widgets/mainPoster/components/image/TemplateImagePanel.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/components/image/TemplateImagePanel.tsx)
- [widgets/mainPoster/utils/imageSlot.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/utils/imageSlot.ts)
- [widgets/mainPoster/utils/slotSelectionBorder.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/utils/slotSelectionBorder.ts)

## 1. 재설계의 핵심 관점

현재 구조의 핵심은 슬롯을 더 이상 "이미지 객체 하나의 변형"으로만 보지 않는다는 점입니다.

슬롯은 개념적으로 다음 3가지를 묶은 단위로 취급됩니다.

- 식별자와 UI 의미를 가진 `meta`
- 화면에서 프레임 자체의 상태를 나타내는 `frame`
- 프레임 내부에서 이미지가 어떻게 배치되는지를 나타내는 `image transform`

즉, 현재 설계의 중심 문장은 다음과 같습니다.

```text
슬롯 = meta + frame + imageTransform
렌더링 객체(Fabric object)는 이 슬롯 상태를 표시하는 매체다.
```

아직 저장 포맷은 레거시 object field를 유지하지만, 런타임 해석은 점점 `SlotEntity` 중심으로 이동하고 있습니다.

## 2. 데이터 모델

### 2-1. SlotEntity

현재 구조에서 슬롯을 표준 형태로 읽을 때 사용하는 모델은 `SlotEntity`입니다.

```ts
type SlotEntity = {
  slotId: string;
  meta: ImageSlotMeta;
  frame: {
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
  };
  image: {
    baseScale: number;
    zoomScale: number;
    offsetX: number;
    offsetY: number;
  };
  frameObjectId?: string;
  imageObjectId?: string;
};
```

의미는 다음과 같습니다.

- `slotId`: 슬롯의 논리 식별자
- `meta`: 교체 가능 여부, 라벨, filled 상태 같은 UI 메타
- `frame`: 실제 프레임 사각형의 월드 좌표 상태
- `image`: 프레임 내부에서 이미지가 어떻게 보이는지에 대한 상태

### 2-2. 기본값 생성

[model.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/model.ts)에는 다음 helper가 있습니다.

- `createDefaultSlotFrame()`
- `createDefaultSlotImageTransform()`
- `createSlotEntity()`
- `DEFAULT_SLOT_ZOOM_SCALE`

역할은 단순하지만 중요합니다.

- 누락된 필드가 있어도 슬롯 모델을 항상 완전한 형태로 만든다.
- 레거시 object를 읽을 때도 `null`이나 `undefined`가 아니라 정상화된 구조로 변환한다.
- UI와 런타임 로직이 부분 필드 존재 여부 대신 표준 모델을 기준으로 동작할 수 있게 한다.

## 3. 레거시 object field와의 경계

현재 프로젝트는 아직 JSON 저장 포맷과 Fabric object 속성에 다음 필드를 유지합니다.

- `slot`
- `slotFrameWidth`
- `slotFrameHeight`
- `slotFrameLeft`
- `slotFrameTop`
- `slotFrameAngle`
- `slotZoomScale`
- `slotImageBaseScale`
- `slotImageOffsetX`
- `slotImageOffsetY`

하지만 이 필드들을 직접 여기저기 읽는 대신, [objectFields.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/objectFields.ts)가 경계 역할을 맡습니다.

### 3-1. object -> model 읽기

주요 함수:

- `getSlotMeta(target)`
- `hasSlotFrameFields(target)`
- `readSlotFrameFields(target)`
- `readSlotImageTransformFields(target)`
- `buildSlotEntityFromObject(target)`

흐름:

```text
Fabric object
-> slot 메타 확인
-> frame 레거시 필드 확인
-> image transform 레거시 필드 확인
-> 누락값은 default로 보정
-> SlotEntity 생성
```

핵심 포인트:

- 슬롯 여부 판별은 `slot.replaceable === true && slot.key 존재`를 기준으로 한다.
- frame 필드가 없는 경우 현재 object의 `left/top/getScaledWidth/getScaledHeight/angle`을 fallback으로 사용한다.
- 즉, "정규화된 슬롯 읽기"는 항상 `buildSlotEntityFromObject()`를 통하는 방향으로 모아지고 있다.

### 3-2. model -> object 쓰기

주요 함수:

- `toSlotFrameFields(frame)`
- `toSlotImageTransformFields(image)`
- `applySlotEntityToObject(target, entity)`

흐름:

```text
SlotEntity
-> frame/image를 레거시 persistence 필드로 변환
-> target.set(...)
-> Fabric object에 반영
```

이 레이어 덕분에 내부 구조는 점진적으로 `SlotEntity`로 이동하면서도 저장 형식은 바로 깨지지 않습니다.

## 4. Geometry 계층

[frameGeometry.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/frameGeometry.ts)는 프레임을 좌표계 단위로 다루는 순수 계산 레이어에 가깝습니다.

주요 함수:

- `hasSlotFrameBounds()`
- `getSlotFrameState()`
- `getSlotSourceSize()`
- `getSlotCoverScale()`
- `getSlotWorldOffset()`
- `resolveSlotImagePlacement()`
- `isPointInsideFrame()`
- `isPointInsideSlotFrameBounds()`
- `createSlotClipPath()`
- `toFrameLocalPoint()`
- `toFrameWorldPoint()`
- `getSlotFrameCoords()`
- `getSlotBoundingBox()`

### 4-1. 왜 이 계층이 중요한가

예전에는 슬롯 이미지의 바운딩 박스와 프레임 개념이 많이 섞여 있었습니다.
현재는 geometry 함수가 다음 규칙을 명확히 만듭니다.

- 선택 판정은 프레임 좌표계를 기준으로 한다.
- 컨트롤 위치도 프레임 좌표계를 기준으로 한다.
- 렌더 위치 계산도 프레임 좌표계를 기준으로 한다.
- export 미리보기 잘라내기도 프레임 bounding box를 기준으로 한다.

즉, 지금 구조에서 프레임은 단순 속성이 아니라 좌표계의 기준점입니다.

### 4-2. 배치 계산 공식

이미지 배치는 `resolveSlotImagePlacement()`가 계산합니다.

```text
baseScale = cover(frame, source)
appliedScale = baseScale * (zoomScale / 100)
worldOffset = rotate(frame.angle, frame.width * offsetX%, frame.height * offsetY%)
image.left = frame.left + worldOffset.x
image.top = frame.top + worldOffset.y
```

결론적으로 현재 구조는 crop 기반보다 "원본 이미지를 확대/이동시키고 frame clipPath로 보이게 하는 방식"에 더 가깝습니다.

## 5. Query 계층

[queries.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/queries.ts)는 Fabric object 컬렉션을 슬롯 관점으로 검색하는 작은 조회 계층입니다.

주요 함수:

- `getSlotId(target)`
- `isSlotObject(target)`
- `isSlotImageObject(target)`
- `isSlotPlaceholderObject(target)`
- `getSlotEntityByTarget(target)`
- `findSlotTargetsBySlotId(canvas, slotId)`
- `findPrimarySlotTargetBySlotId(canvas, slotId)`

핵심 규칙:

- 동일한 `slotId`를 공유하는 placeholder와 image가 공존할 수 있다.
- 이 경우 대표 target은 가능하면 `FabricImage`를 우선한다.
- UI는 object 자체보다 `slotId`로 슬롯을 다시 찾는 방식으로 안정성을 얻는다.

이 변화는 특히 파일 업로드 후 객체가 `Rect -> FabricImage`로 교체되는 흐름에서 중요합니다.

## 6. Runtime 계층

[runtime.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/slot/runtime.ts)는 슬롯 관련 "런타임 전용 상태"를 WeakMap으로 관리합니다.

관리 대상:

- placeholder runtime
- slot image runtime
- canvas runtime

저장 정보 예시:

- 원래 `_render` 백업
- moving/scaling/rotating/modified handler 참조
- `isSyncingTransform` 같은 순환 방지 플래그
- selection area patch의 원본 함수 참조
- 원래 `containsPoint` 참조

### 6-1. 왜 WeakMap으로 옮겼는가

기존 방식은 Fabric object에 `__...` 같은 런타임 필드를 직접 붙이기 쉬웠습니다.
현재 구조는 이를 줄이고 다음 원칙을 따릅니다.

- persistence state와 runtime state를 분리한다.
- JSON 저장 대상이 아닌 정보는 WeakMap에 둔다.
- 복원/정리 시 attach-detach 경계가 선명해진다.

## 7. useFabricSlot의 역할

[useFabricSlot.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/hooks/useFabricSlot.tsx)는 현재 프레임 재설계의 메인 오케스트레이터입니다.

이 훅이 하는 일은 크게 5가지입니다.

- 슬롯 placeholder 렌더링 부착
- 슬롯 이미지 hit area/behavior 부착
- 슬롯 object의 transform 동기화
- 슬롯 CRUD 성격의 API 제공
- 슬롯 기반 미리보기 export 제공

## 8. 함수별 상세 흐름

### 8-1. `applySlotMetadata(rect)`

빈 슬롯 placeholder에 슬롯 의미를 부여합니다.

역할:

- slot 메타가 없으면 새 slot 메타 생성
- `name: 'slot-placeholder'` 부여
- fill/stroke/lock 상태 설정
- 빈 슬롯 패턴 렌더링 준비

시퀀스:

```text
Rect 생성 또는 기존 Rect 선택
-> applySlotMetadata(rect)
-> slot 메타 결정
-> placeholder 속성 부여
-> 이후 attachSlotRectBehavior(rect)
```

### 8-2. `attachSlotRectBehavior(rect)`

placeholder에 렌더와 수정 후처리를 붙입니다.

역할:

- placeholder 아이콘 렌더 부착
- scale 정규화
- 패턴 재계산
- 슬롯 placeholder다운 interaction 상태 유지

의미:

- 빈 슬롯은 단순 Rect가 아니라, 슬롯으로서의 시각적/행동적 규칙을 가진 객체가 된다.

### 8-3. `applySlotImageTransform(image, frameOverride?, transformOverride?)`

현재 구조의 핵심 렌더 함수입니다.

입력:

- 현재 이미지 객체
- 필요하면 덮어쓸 frame 정보
- 필요하면 덮어쓸 image transform 정보

처리 순서:

```text
image에서 현재 slot image state 읽기
-> getSlotFrameState(image)
-> frameOverride 반영
-> getResolvedSlotImageTransform(image, frame)
-> zoomScale / offsetX / offsetY clamp
-> resolveSlotImagePlacement(frame, source, zoom, offset, baseScale)
-> image.set(left, top, angle, scaleX, scaleY, slotFrame*, slotImage*)
-> image.clipPath = createSlotClipPath(frame)
-> applySlotFrameControlVisibility(image)
-> image.setCoords()
```

핵심 의미:

- object의 시각 상태와 슬롯 persistence 상태를 한 번에 다시 맞춘다.
- 화면 표시와 저장 필드가 같은 함수에서 일관되게 갱신된다.

### 8-4. `syncSlotFrameFromImageTransform(image, mode)`

사용자가 캔버스에서 직접 슬롯 이미지를 움직이거나 회전하거나 리사이즈할 때, 그 결과를 다시 frame 상태로 역산합니다.

분기:

- `move`: `getMovedSlotFrameFromImage()` 사용
- `resize`: `getResizedSlotFrameFromImage()` 사용
- `rotate`: 현재 image angle로 frame angle 갱신

시퀀스:

```text
moving/scaling/rotating/modified 이벤트 발생
-> syncSlotFrameFromImageTransform(image, mode)
-> 현재 frame 읽기
-> 모드별 nextFrame 계산
-> syncSlotImageToFrame(image, nextFrame)
-> applySlotImageTransform(...) 재적용
```

이 흐름 덕분에 "이미지를 드래그했지만 실제로는 프레임을 업데이트하는" 구조가 유지됩니다.

### 8-5. `attachSlotImageBehavior(image)`

슬롯 이미지에 transform 이벤트 핸들러를 부착합니다.

부착 이벤트:

- `moving`
- `scaling`
- `rotating`
- `modified`

시퀀스:

```text
object:added 또는 초기 canvas sync
-> attachSlotImageBehavior(image)
-> WeakMap runtime 확보
-> 이벤트 핸들러 연결
-> 각 이벤트에서 syncSlotFrameFromImageTransform 호출
```

보호 장치:

- `isSyncingTransform`으로 재진입을 방지한다.
- `lastTransformMode`로 `modified` 시점의 후속 동기화 모드를 기억한다.

### 8-6. `attachSlotImageHitArea(image)`

슬롯 이미지는 실제 이미지 픽셀보다 프레임을 기준으로 클릭되어야 하므로, hit area를 프레임 기준으로 패치합니다.

핵심 의도:

- 이미지가 프레임 밖으로 크게 보이더라도 클릭 판정은 프레임 영역 안에서만 받는다.
- 사용자가 "보이는 프레임"을 대상으로 조작한다고 느끼게 만든다.

### 8-7. `attachSlotSelectionAreaPatch(canvas)`

canvas 수준의 selection area 판정도 프레임 기준으로 바꿉니다.

시퀀스:

```text
useFabricSlot mount
-> canvas 원본 _pointIsInObjectSelectionArea 백업
-> 슬롯 이미지면 frame polygon으로 selection area 계산
-> 일반 object면 원래 로직 사용
```

이 패치는 selection drag 영역까지 프레임 좌표계와 맞추는 역할을 합니다.

### 8-8. `replaceSlotImage(targetImage, url)`

빈 슬롯 또는 기존 슬롯 이미지를 새 이미지로 교체합니다.

시퀀스:

```text
replaceSlotImage(targetImage, url)
-> canvas 내 object index 찾기
-> getSlotFrameState(targetImage)
-> getSlotMeta(targetImage)
-> FabricImage.fromURL(url)
-> applySlotEntityToObject(nextImage, filled: true, frame 유지)
-> 기존 flip/opacity/visible/isLocked/filter 복사
-> applySlotImageTransform(nextImage, frame, 기본 zoom/offset)
-> 기존 object 제거
-> 같은 index에 nextImage 삽입
-> active object 설정
-> render / syncActiveObjectInfo / saveHistory
```

중요한 점:

- 교체 전후 source object 타입은 달라질 수 있다.
- 하지만 slot 메타와 slotId는 유지된다.
- UI는 이후에도 같은 슬롯으로 계속 다룰 수 있다.

### 8-9. `restoreSlotPlaceholder(targetImage)`

슬롯 이미지를 다시 빈 placeholder로 복원합니다.

시퀀스:

```text
slot image 선택
-> frame 상태 읽기
-> 동일 frame의 Rect placeholder 생성
-> applySlotEntityToObject(... filled: false)
-> applySlotMetadata(placeholder)
-> attachSlotRectBehavior(placeholder)
-> 기존 image 제거
-> placeholder 삽입
```

즉, 이 구조는 "객체를 지우는 것"이 아니라 "같은 slotId의 표현체를 image에서 placeholder로 되돌리는 것"에 가깝습니다.

### 8-10. `updateSlotImageScale()` / `updateSlotImagePosition()`

TemplateImagePanel에서 사용하는 대표적인 편집 API입니다.

공통 시퀀스:

```text
UI 입력
-> slotId 기준 이미지 찾기
-> applySlotImageTransform(... override)
-> canvas.setActiveObject(image)
-> render
-> 필요 시 history/save/sync
```

의미:

- UI는 object field를 직접 만지지 않는다.
- `slotId -> slot image 조회 -> slot API 호출` 구조를 사용한다.

### 8-11. `getActiveSlotEntity()`

현재 활성 객체를 표준 슬롯 모델로 읽어 주는 함수입니다.

시퀀스:

```text
canvas.getActiveObject()
-> getSlotEntityByTarget(target)
-> buildSlotEntityFromObject(target)
-> SlotEntity 반환
```

이 함수는 UI가 active object의 Fabric 세부사항 대신 슬롯 관점으로 상태를 읽게 해 줍니다.

### 8-12. `exportSlotImagePreview(image)`

슬롯 패널 미리보기를 위해 프레임 bounding box 기준으로 프리뷰 이미지를 잘라냅니다.

시퀀스:

```text
frame = getSlotFrameState(image)
-> bounds = getSlotBoundingBox(frame)
-> 다른 object 임시 숨김
-> canvas.toDataURL(bounds 기준)
-> visibility 복원
-> active object 복원
```

핵심은 preview export도 실제 image box가 아니라 frame box 기준이라는 점입니다.

## 9. 이벤트별 흐름

### 9-1. 초기 로드

관련 진입점:

- `MainPosterPreview`의 `loadFromJSON`
- `useFabricSlot`의 `object:added` sync

시퀀스:

```text
JSON load
-> canvas.loadFromJSON(json)
-> Fabric object 생성
-> object:added 반복 발생
-> useFabricSlot의 syncSlotObject(target)
-> slot rect면 placeholder behavior 부착
-> slot image면 transform/hit area/behavior 부착
```

의미:

- 저장 포맷이 아직 레거시여도 런타임 진입 시점에는 현재 재설계 규칙이 다시 부착된다.

### 9-2. 빈 슬롯 클릭 후 업로드

관련 진입점:

- `MainPosterPreview.handleMouseUp`
- `openSlotFilePicker`
- file input `onChange`
- `replaceSlotImageBySlot`

시퀀스:

```text
사용자 클릭
-> mouse:up
-> isReplaceableSlotTarget + frame hit test 확인
-> active object를 slot target으로 설정
-> 빈 슬롯이면 openSlotFilePicker(target)
-> pendingSlotRef에 slotId 저장
-> 파일 선택
-> compressImage(base64)
-> replaceSlotImageBySlot(slotId, compressed)
-> replaceSlotImage(target, url)
```

여기서 중요한 변화는 `pendingSlotRef`가 object 참조가 아니라 `slotId`를 기억한다는 점입니다.

### 9-3. 채워진 슬롯 클릭 후 편집 패널 진입

시퀀스:

```text
사용자 클릭
-> mouse:up
-> slot target 확인
-> canvas.setActiveObject(slotTarget)
-> setActiveTab('image')
-> ImagePanel이 panelMode === 'frame-image' 판단
-> TemplateImagePanel 렌더
-> getActiveSlotEntity()로 현재 슬롯 읽기
```

즉, 패널 진입 기준도 점점 "이미지 객체가 선택되었는가"보다 "활성 슬롯 엔티티가 무엇인가" 쪽으로 이동합니다.

### 9-4. 패널에서 X/Y 이동 조절

관련 진입점:

- `TemplateImagePanel.handleSlotPositionChange`
- `TemplateImagePanel.handleSlotPositionCommit`

시퀀스:

```text
슬라이더 변경
-> updateSlotImagePositionBySlot(slotId, axis, value)
-> findSlotImageBySlotId(slotId)
-> updateSlotImagePosition(image, axis, value)
-> applySlotImageTransform(image, transformOverride)
-> render

슬라이더 확정
-> 같은 흐름
-> saveHistory + syncActiveObjectInfo + preview 갱신 추가
```

### 9-5. 패널에서 scale 조절

시퀀스는 position과 동일하고, override 값만 `zoomScale`로 바뀝니다.

```text
슬라이더 변경
-> updateSlotImageScaleBySlot(slotId, value)
-> applySlotImageTransform(image, { zoomScale: value })
```

### 9-6. 캔버스에서 직접 이동

시퀀스:

```text
사용자 드래그
-> Fabric moving
-> slot image runtime.movingHandler
-> syncSlotFrameFromImageTransform(image, 'move')
-> getMovedSlotFrameFromImage()
-> syncSlotImageToFrame(image, nextFrame)
-> applySlotImageTransform(image, nextFrame)
```

해석:

- 사용자는 이미지를 끌고 있지만,
- 시스템은 프레임 좌표를 재계산하고,
- 다시 그 프레임에 맞는 슬롯 이미지 배치를 계산합니다.

### 9-7. 캔버스에서 직접 회전

시퀀스:

```text
회전 핸들 드래그
-> rotating
-> syncSlotFrameFromImageTransform(image, 'rotate')
-> frame.angle 갱신
-> syncSlotImageToFrame(image, nextFrame)
```

### 9-8. 캔버스에서 직접 리사이즈

현재 구조에는 두 경로가 공존합니다.

경로 A. `useSetFabricControls`의 frame-aware control action

```text
사용자 corner/side control 드래그
-> scaleSlotFrameTarget()
-> getScaledFrameFromSideControl() 또는 getScaledFrameFromCornerControl()
-> applySlotFrameTransform(target, nextFrame)
-> frame 기준으로 즉시 렌더 재계산
```

경로 B. Fabric scaling 이벤트 후속 동기화

```text
scaling / modified
-> syncSlotFrameFromImageTransform(image, 'resize')
-> getResizedSlotFrameFromImage()
-> syncSlotImageToFrame(image, nextFrame)
```

문서상 해석은 다음이 더 중요합니다.

- 리사이즈의 기준은 실제 이미지 박스가 아니라 frame이다.
- 컨트롤 위치, 회전 중심, resize 계산 모두 frame 좌표계로 통일되고 있다.

## 10. useSetFabricControls의 역할

[useSetFabricControls.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/hooks/useSetFabricControls.tsx)는 프레임 기준 컨트롤 체계를 담당합니다.

핵심 책임:

- 슬롯 이미지의 control 위치를 frame 위에 맞춘다.
- resize/rotate action을 frame 기준 계산으로 대체한다.
- selection border도 frame 기준으로 보정한다.

### 10-1. `applySlotFrameTransform(target, frame)`

이 함수는 `useSetFabricControls` 쪽의 frame 중심 렌더 적용 함수입니다.

역할:

- source size 조회
- zoom/offset 읽기
- `resolveSlotImagePlacement()` 호출
- `slotFrame*`, `slotImage*`, `clipPath` 반영
- frame 기준으로 화면 재배치

즉, `useFabricSlot`의 `applySlotImageTransform()`과 같은 철학을 컨트롤 계층에서도 유지합니다.

### 10-2. frame-aware position handler

`createFrameAwarePositionHandler()`는 control의 시각적 위치를 object bbox 대신 frame으로 계산합니다.

효과:

- 핸들 위치가 실제 보이는 프레임 경계와 일치한다.
- 회전 후에도 corner/side 위치가 프레임 기준으로 안정적이다.

### 10-3. frame-aware rotate / scale action

핵심 함수:

- `rotateSlotFrameTarget()`
- `scaleSlotFrameTarget()`
- `getScaledFrameFromSideControl()`
- `getScaledFrameFromCornerControl()`

시퀀스:

```text
control drag
-> 현재 frame 읽기
-> 포인터를 frame local 좌표로 변환
-> nextFrame 계산
-> applySlotFrameTransform(target, nextFrame)
```

즉, 컨트롤은 더 이상 "이미지를 어떻게 transform할까"를 직접 생각하지 않고, "프레임을 어떻게 바꿀까"를 먼저 계산합니다.

## 11. MainPosterPreview와 UI 연결

### 11-1. 클릭 판정

[MainPosterPreview.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)는 슬롯 객체를 특별 취급합니다.

규칙:

- 슬롯 이미지는 `containsPoint()` 대신 `isPointInsideSlotFrame()` 사용
- 빈 슬롯/채워진 슬롯 모두 `isReplaceableSlotTarget()` 기준으로 판별
- 빈 슬롯이면 업로드 흐름 자동 진입

이 덕분에 "이미지가 프레임 바깥으로 튀어나와도 클릭 기준은 프레임"이라는 UX가 유지됩니다.

### 11-2. 패널 선택

`getImagePanelMode()` 분기:

- `background-image`
- `frame-image`
- `empty-frame`
- `user-image`

현재 흐름에서는 `frame-image`와 `empty-frame` 모두 결국 image 탭으로 진입하지만, 내부에서 슬롯 전용 편집 흐름을 사용합니다.

## 12. TemplateImagePanel의 의미 변화

[TemplateImagePanel.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/components/image/TemplateImagePanel.tsx)는 예전보다 더 명확하게 슬롯 API 소비자 역할만 합니다.

현재 특징:

- `getActiveSlotEntity()`로 활성 슬롯 식별
- `activeSlotKey = activeSlotEntity?.slotId` 사용
- 이후 모든 조회/변경을 `...BySlot(slotId)` API로 수행

예시:

- `replaceSlotImageBySlot(slotId, url)`
- `restoreSlotPlaceholderBySlot(slotId)`
- `getSlotImagePositionBySlot(slotId)`
- `updateSlotImagePositionBySlot(slotId, axis, value)`
- `getSlotImageScaleBySlot(slotId)`
- `updateSlotImageScaleBySlot(slotId, value)`
- `exportSlotImagePreviewBySlot(slotId)`

이건 구조적으로 큰 변화입니다.

```text
이전: activeObject를 직접 읽고 조작
현재: active slot entity / slotId를 통해 조작
```

## 13. selection border와 hit area

### 13-1. `slotSelectionBorder.ts`

이 파일은 selection border를 프레임 기준으로 다시 그리게 만듭니다.

핵심:

- `getSlotFrameState(target)`로 frame을 읽음
- 실제 image center와 frame center의 차이를 보정
- 확대 배율을 반영한 뒤 frame 박스를 테두리로 그림

즉, 화면에 보이는 선택 테두리도 이제 object bounding box가 아니라 frame bounding box입니다.

### 13-2. hit area / selection area / control 위치의 통일

현재 구조는 다음 세 가지를 같은 기준으로 맞추려 합니다.

```text
클릭 판정 = frame 기준
선택 영역 = frame 기준
컨트롤 위치 = frame 기준
```

이 통일성이 현재 재설계의 가장 큰 UX 개선 포인트 중 하나입니다.

## 14. 전체 시퀀스 다이어그램

### 14-1. 빈 슬롯 생성부터 채우기까지

```text
addSlotRect()
-> Rect 생성
-> applySlotMetadata()
-> attachSlotRectBehavior()
-> canvas.add(rect)
-> active object 설정
-> saveHistory()

사용자 빈 슬롯 클릭
-> mouse:up
-> openSlotFilePicker()
-> pendingSlotRef = slotId
-> 파일 선택
-> replaceSlotImageBySlot(slotId, url)
-> replaceSlotImage(target, url)
-> applySlotEntityToObject(nextImage, filled: true)
-> applySlotImageTransform(nextImage)
-> Rect -> FabricImage 교체
```

### 14-2. 채워진 슬롯 편집

```text
사용자 슬롯 이미지 클릭
-> selection / active object 설정
-> TemplateImagePanel 렌더
-> getActiveSlotEntity()
-> slotId 확보

사용자 X/Y/scale 조절
-> ...BySlot(slotId) API 호출
-> 실제 target image 조회
-> applySlotImageTransform(...override)
-> render
-> 필요 시 history 저장
```

### 14-3. 캔버스 직접 조작

```text
사용자 드래그/회전/리사이즈
-> frame-aware control 또는 Fabric transform 이벤트 발생
-> syncSlotFrameFromImageTransform()
-> nextFrame 계산
-> syncSlotImageToFrame()
-> applySlotImageTransform()
-> frame/persistence/렌더 동기화
```

### 14-4. 로드 후 복원

```text
canvas.loadFromJSON()
-> object:added
-> syncSlotObject(target)
-> placeholder면 behavior 재부착
-> image면 transform/hitArea/selection/runtime 재부착
-> 현재 구조 규칙으로 재정렬
```

## 15. frameFlow와 현재 구조의 차이

### 15-1. 설명 단위가 달라졌다

기존 `frameFlow.md`는 주로 다음을 설명합니다.

- 레거시 object field가 무엇인지
- `replaceSlotImage()`와 `applySlotImageTransform()`이 어떻게 동작하는지
- 슬롯을 image-like object 흐름으로 이해하는 방식

현재 구조는 다음 단위로 보는 편이 더 정확합니다.

- `SlotEntity`라는 정규화 모델
- `objectFields`라는 호환 경계
- `queries`라는 조회 레이어
- `runtime`이라는 WeakMap 상태 레이어
- `slotId` 기반 API

즉, 설명 중심이 "필드"에서 "구조"로 옮겨갔습니다.

### 15-2. activeObject 직접 조작 비중이 줄었다

기존 흐름:

- active object를 바로 읽음
- object field를 직접 해석함
- object 교체 후 참조 유지가 상대적으로 불안정함

현재 흐름:

- `getActiveSlotEntity()`로 슬롯을 읽음
- `slotId`로 다시 target을 조회함
- `...BySlot()` API로 조작함

효과:

- `Rect -> FabricImage` 교체 뒤에도 UI 흐름이 안정적이다.
- 특정 object 인스턴스에 덜 의존한다.

### 15-3. runtime 상태 분리가 명확해졌다

기존 문서에서는 런타임 부착 코드가 많이 보이지만, 상태 경계가 뚜렷하게 드러나지 않습니다.
현재 구조에서는 `runtime.ts`가 다음 사실을 분명히 합니다.

- 저장 대상 상태와 런타임 상태는 다르다.
- 이벤트 핸들러와 원본 메서드 백업은 WeakMap으로 관리한다.
- attach/detach lifecycle이 구조화되었다.

### 15-4. 프레임 좌표계가 더 강한 기준이 되었다

기존 `frameFlow`도 frame 기준 hit area와 border를 설명하지만, 현재 구조는 그걸 더 체계화합니다.

현재 강화된 부분:

- geometry helper 분리
- frame-aware control position handler 도입
- frame-aware rotate/scale action 분리
- selection border patch 정리
- guide point 수집도 frame 기준으로 옮기는 방향 명시

즉, "프레임처럼 보이게 한다"에서 "실제로 프레임 좌표계로 동작하게 한다"로 이동 중입니다.

### 15-5. 레거시 호환은 유지하되 진입점이 좁아졌다

기존 구조는 여러 곳에서 `slotFrame*`, `slotImage*`를 직접 읽고 쓸 가능성이 있었습니다.
현재 구조는 그 접근을 점점 아래 경계로 모읍니다.

- 읽기: `buildSlotEntityFromObject()`
- 쓰기: `applySlotEntityToObject()`
- 조회: `queries.ts`

효과:

- 이후 레거시 필드 제거 시 수정 범위가 줄어든다.
- 저장 포맷 변경과 런타임 구조 변경을 분리해서 진행할 수 있다.

### 15-6. UI와 도메인 로직의 경계가 더 좋아졌다

기존에는 `TemplateImagePanel` 같은 UI가 object를 더 직접적으로 이해해야 했습니다.
현재는 다음처럼 바뀝니다.

```text
UI
-> slotId 기반 API 호출
-> hook 내부에서 object 조회/변환/렌더 수행
```

이건 재사용성과 테스트 용이성 측면에서 훨씬 낫습니다.

## 16. 현재 구조를 한 문장으로 요약하면

현재 프레임 재설계 구조는 "레거시 Fabric object field를 즉시 없애지는 않지만, 슬롯을 `SlotEntity`와 frame 좌표계 중심으로 다시 해석하고, UI는 `slotId` 기반 API를 통해 그 구조를 소비하도록 바꾸는 과정"이라고 볼 수 있습니다.

조금 더 짧게 말하면 다음과 같습니다.

```text
기존 frameFlow = 슬롯 필드가 어떻게 굴러가는가
현재 구조 = 슬롯을 어떤 계층으로 분리해서 다루는가
```

## 17. 남아 있는 과제

현재 코드 기준으로 아직 완전히 끝나지 않은 지점도 보입니다.

- 저장 포맷은 여전히 레거시 object field를 유지한다.
- 일부 로직은 여전히 Fabric object 변형 이벤트에 의존한다.
- frame 기준 가이드라인은 보강 중이며, `collect-point.ts` 주석에도 전환 중 맥락이 남아 있다.
- `frameObjectId`와 `imageObjectId`는 모델에 있지만, 장기적으로 2-object 구조까지 갈지 여부는 아직 열려 있다.

즉, 지금 구조는 "최종 도착점"이라기보다 "레거시 호환을 유지한 채 구조적 중심을 옮기는 중간 단계"에 가깝습니다.
