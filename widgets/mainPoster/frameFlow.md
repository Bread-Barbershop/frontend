# Main Poster Frame(Slot) Flow

이 문서는 `widgets/mainPoster` 기준으로 메인포스터의 프레임(슬롯) 기능이 어떻게 동작하는지 코드 흐름 중심으로 정리한 초안입니다.

주요 기준 파일:

- [widgets/mainPoster/hooks/useFabricSlot.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/hooks/useFabricSlot.tsx)
- [widgets/mainPoster/hooks/useFabric.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/hooks/useFabric.ts)
- [widgets/mainPoster/components/MainPosterPreview.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)
- [widgets/mainPoster/components/image/TemplateImagePanel.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/components/image/TemplateImagePanel.tsx)
- [widgets/mainPoster/utils/imageSlot.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/utils/imageSlot.ts)
- [widgets/mainPoster/hooks/useSetFabricControls.tsx](/c:/bread-barbershop/frontend/widgets/mainPoster/hooks/useSetFabricControls.tsx)
- [widgets/mainPoster/utils/slotSelectionBorder.ts](/c:/bread-barbershop/frontend/widgets/mainPoster/utils/slotSelectionBorder.ts)

## 1. 슬롯이란 무엇인가

이 프로젝트에서 슬롯은 별도 엔티티가 아닙니다.

슬롯은 Fabric 객체 내부의 `slot` 메타데이터로 표현됩니다.

```ts
export interface ImageSlotMeta {
  key: string;
  label?: string;
  replaceable?: boolean;
  aspectMode?: 'cover' | 'contain';
  required?: boolean;
  order?: number;
  filled?: boolean;
}
```

실질적으로 슬롯으로 인정되는 조건은 다음과 같습니다.

```ts
slot?.replaceable === true && slot.key가 존재
```

즉:

- 빈 슬롯은 `Rect + slot 메타`
- 채워진 슬롯은 `FabricImage + slot 메타`

형태로 존재합니다.

## 2. 슬롯 관련 핵심 상태값

슬롯 시스템은 일반 이미지보다 더 많은 커스텀 상태를 씁니다.

### 2-1. 정체성 메타

- `slot`
  - 이 객체가 슬롯인지 나타내는 메타데이터
  - `filled` 값으로 빈 슬롯 / 채워진 슬롯 상태를 구분

### 2-2. 프레임 상태

- `slotFrameWidth`
- `slotFrameHeight`
- `slotFrameLeft`
- `slotFrameTop`
- `slotFrameAngle`

의미:

- 슬롯 프레임 자체의 크기
- 슬롯 프레임의 중심 위치
- 슬롯 프레임의 회전값

### 2-3. 프레임 내부 이미지 상태

- `slotImageBaseScale`
  - 원본 이미지를 프레임에 `cover`로 맞출 때의 기본 배율
- `slotZoomScale`
  - 사용자 확대값, 기본값 `100`
- `slotImageOffsetX`
- `slotImageOffsetY`
  - 프레임 안에서 이미지를 어느 방향으로 밀어 보여줄지 나타내는 값

핵심 요약:

```text
slotFrame* = 프레임 상태
slotImage* = 프레임 안 이미지 상태
applySlotImageTransform() = 둘을 합쳐 최종 화면 결과를 만드는 함수
```

## 3. 슬롯 생성 방식

### 3-1. 새 슬롯 생성

`addSlotRect()`는 새 `Rect`를 만들고 즉시 슬롯 메타를 붙입니다.

흐름:

```text
addSlotRect()
-> new Rect(...)
-> applySlotMetadata(rect)
-> attachSlotRectBehavior(rect)
-> canvas.add(rect)
-> canvas.setActiveObject(rect)
-> saveHistory()
```

### 3-2. 기존 rect를 슬롯으로 변환

`convertActiveRectToSlot()`는 현재 선택된 일반 rect를 슬롯으로 바꿉니다.

흐름:

```text
convertActiveRectToSlot()
-> activeObject가 Rect인지 확인
-> normalizeSlotRectScale(rect)
-> applySlotMetadata(rect)
-> attachSlotRectBehavior(rect)
-> saveHistory()
```

### 3-3. 슬롯 placeholder 메타 적용

`applySlotMetadata()`는 아래 역할을 맡습니다.

- `id` 부여
- `name: 'slot-placeholder'` 부여
- `slot` 메타 부여
- 슬롯 패턴 fill 적용

즉 이 시점부터 단순 rect가 아니라 "교체 가능한 사진 프레임"이 됩니다.

## 4. 빈 슬롯 렌더링 방식

빈 슬롯은 단순 회색 rect가 아니라:

- 체크 패턴
- 업로드 아이콘

을 가진 placeholder로 렌더링됩니다.

핵심 흐름:

```text
attachSlotRectBehavior()
-> attachSlotPlaceholderRender()
-> Rect._render를 감싸서 아이콘 추가 렌더
-> modified 이벤트에서 scale 정규화 + 패턴 재계산
```

여기서 중요한 점은 슬롯 rect를 리사이즈했을 때 `scaleX/scaleY`만 남기지 않고 실제 `width/height`로 정규화한다는 점입니다.

## 5. 슬롯 판별과 패널 분기

슬롯 여부 판별은 `utils/imageSlot.ts`에서 처리합니다.

핵심 함수:

- `getSlotMeta()`
- `isReplaceableSlotTarget()`
- `isReplaceableSlotImage()`
- `isFilledSlotImage()`
- `getImagePanelMode()`

패널 분기:

```text
background-image -> BackgroundImagePanel
frame-image -> TemplateImagePanel
empty-frame -> image 탭 진입 후 빈 슬롯 흐름
user-image -> DefaultImagePanel
```

즉 UI 레벨에서는 모두 `image` 탭처럼 보여도, 내부 편집 패널은 다르게 갈라집니다.

## 6. 빈 슬롯 클릭부터 이미지 교체까지 타임라인

### 6-1. 클릭 시점

```text
사용자 클릭
-> MainPosterPreview mouse:down
-> 클릭 좌표 계산
-> 슬롯 프레임 내부 클릭인지 검사
-> 필요하면 뒤 객체 재선택 처리
```

여기서 슬롯 이미지는 일반 `containsPoint()`가 아니라 프레임 기준 판정을 사용합니다.

### 6-2. mouse:up 시점

```text
MainPosterPreview mouse:up
-> isReplaceableSlotTarget(target) 확인
-> 포인터가 실제 슬롯 프레임 내부인지 확인
-> canvas.setActiveObject(slotTarget)
-> setActiveTab('image')
-> 빈 슬롯이면 openSlotFilePicker(slotTarget)
```

즉:

- 채워진 슬롯은 선택만 됨
- 빈 슬롯은 자동으로 업로드창이 열림

### 6-3. 파일 선택기 열기

```text
openSlotFilePicker(target)
-> suppressSelectionClearedRef = true
-> suppressOutsideClickRef = true
-> pendingSlotRef.current = target
-> hidden file input click
```

`pendingSlotRef`는 "이번 업로드가 어느 슬롯을 위한 것인지" 기억하는 저장소입니다.

### 6-4. 파일 선택 후 실제 교체

```text
input onChange
-> FileReader 로 base64 읽기
-> compressImage(base64)
-> replaceSlotImage(slotTarget, compressed)
```

## 7. `replaceSlotImage()` 흐름

이 함수는 슬롯 교체의 핵심입니다.

```text
replaceSlotImage(targetImage, url)
-> canvas에서 기존 객체 index 확인
-> getSlotFrameState(targetImage)
-> 기존 slot 메타 읽기
-> FabricImage.fromURL(url)
-> 새 이미지에 기존 slot 메타 복사
-> filled: true 설정
-> 기존 flip/opacity/visible/isLocked/filter 계승
-> applySlotImageTransform(nextImage, frame, {
     offsetX: 0,
     offsetY: 0,
     zoomScale: 100
   })
-> canvas.remove(targetImage)
-> canvas.insertAt(objectIndex, nextImage)
-> canvas.setActiveObject(nextImage)
-> syncActiveObjectInfo(canvas)
-> saveHistory()
```

핵심 포인트:

- 객체 타입은 `Rect -> FabricImage`로 바뀔 수 있음
- 하지만 `slot` 메타는 유지됨
- 그래서 새 이미지도 계속 슬롯처럼 동작함

## 8. 슬롯 이미지의 핵심 렌더 함수: `applySlotImageTransform()`

슬롯 시스템 전체의 중심 함수는 `applySlotImageTransform()`입니다.

이 함수는 다음 역할을 한 번에 합니다.

- 프레임 상태 읽기
- 원본 이미지 크기 읽기
- `cover` 기본 배율 계산
- 사용자 확대값 반영
- 프레임 내부 위치 오프셋 반영
- clipPath 생성
- 최종 이미지 위치/스케일/회전 적용

### 8-1. 계산 순서

```text
applySlotImageTransform(image, frameOverride?, transformOverride?)
-> getSlotFrameState(image)
-> override 반영해서 최종 frame 구성
-> getImageSourceSize(image)
-> legacyTransform 추정
-> baseScale 결정
-> zoomScale 결정
-> offsetX / offsetY 결정
-> appliedScale = baseScale * (zoomScale / 100)
-> worldOffset = getSlotWorldOffset(frame, offsetX, offsetY)
-> image.set(...)
-> image.clipPath = createSlotClipPath(frame)
-> applySlotFrameControlVisibility(image)
-> image.setCoords()
```

### 8-2. 수식 요약

```text
기본 배율 = cover 기준 배율
최종 배율 = slotImageBaseScale * (slotZoomScale / 100)
최종 중심 = frame 중심 + 회전된 offset
최종 표시 = clipPath(frame)로 마스킹된 이미지
```

### 8-3. 중요한 특징

현재 슬롯 시스템은 `cropX/cropY` 기반이 아니라:

- 큰 이미지를 두고
- `clipPath`로 프레임 영역만 보이게 하고
- `offset + zoom`으로 내부 시점을 조정

하는 방식입니다.

즉 일반 이미지 crop 시스템과 슬롯 시스템은 구조가 다릅니다.

## 9. 숫자 예시로 보는 `applySlotImageTransform()`

가정:

- 프레임: `200 x 300`
- 프레임 중심: `(150, 400)`
- 프레임 회전: `30도`
- 원본 이미지: `1000 x 800`
- `slotZoomScale = 150`
- `slotImageOffsetX = 10`
- `slotImageOffsetY = -20`

### 9-1. cover 기본 배율

```text
200 / 1000 = 0.2
300 / 800 = 0.375
baseScale = max(0.2, 0.375) = 0.375
```

### 9-2. 사용자 확대 반영

```text
appliedScale = 0.375 * (150 / 100) = 0.5625
```

즉 최종 렌더 크기:

- 가로: `1000 * 0.5625 = 562.5`
- 세로: `800 * 0.5625 = 450`

### 9-3. 내부 위치 오프셋

```text
offsetXPx = 200 * 10 / 100 = 20
offsetYPx = 300 * -20 / 100 = -60
```

회전 30도를 반영한 월드 좌표 변환:

```text
worldX = 20 * cos(30) - (-60) * sin(30)
       ≈ 47.32

worldY = 20 * sin(30) + (-60) * cos(30)
       ≈ -41.96
```

### 9-4. 최종 중심 좌표

```text
image.left = 150 + 47.32 = 197.32
image.top = 400 - 41.96 = 358.04
```

즉 최종적으로:

- 회전 30도
- scale 0.5625
- 중심 `(197.32, 358.04)`
- clipPath는 `(150, 400)` 중심의 `200 x 300` 프레임

상태가 됩니다.

## 10. 채워진 슬롯 클릭 후 편집 진입 타임라인

```text
사용자 슬롯 이미지 클릭
-> MainPosterPreview mouse:down
-> 슬롯 프레임 내부 판정
-> mouse:up
-> slotTarget 인정
-> canvas.setActiveObject(slotTarget)
-> selection:created / selection:updated
-> getImagePanelMode(activeObj) === 'frame-image'
-> ImagePanel
-> TemplateImagePanel 렌더
```

즉 바깥쪽은 image 탭이지만, 실제 편집은 슬롯 전용 패널로 들어갑니다.

## 11. `TemplateImagePanel` 편집 플로우

### 11-1. 슬롯 내부 X/Y 조절

```text
사용자 슬라이더 드래그
-> handleSlotPositionChange(axis, value)
-> updateSlotImagePosition(image, axis, value)
-> applySlotImageTransform(..., {
     offsetX 또는 offsetY override
   })
-> canvas.requestRenderAll()
```

커밋 시점:

```text
사용자 슬라이더 손 뗌
-> handleSlotPositionCommit(axis, value)
-> updateSlotImagePosition(..., {
     saveHistory: true,
     syncActiveObjectInfo: true
   })
-> exportSlotImagePreview()
```

### 11-2. 슬롯 배율 조절

```text
사용자 슬라이더 드래그
-> handleSlotScaleChange(value)
-> updateSlotImageScale(image, value)
-> applySlotImageTransform(..., {
     zoomScale: value
   })
```

커밋 시점:

```text
사용자 슬라이더 손 뗌
-> handleSlotScaleCommit(value)
-> updateSlotImageScale(..., {
     saveHistory: true,
     syncActiveObjectInfo: true
   })
-> exportSlotImagePreview()
```

즉 패널은 직접 계산을 하지 않고, 슬롯 훅 함수를 호출하는 얇은 UI 레이어입니다.

## 12. 슬롯 전체 이동, 크기조절, 회전

### 12-1. 슬롯 전체 이동

```text
사용자 캔버스에서 슬롯 드래그
-> Fabric moving
-> __slotImageMovingHandler
-> 현재 frame 상태 읽기
-> 현재 offset 기준 예상 이미지 위치 계산
-> 실제 드래그 결과와 delta 비교
-> nextFrameLeft / nextFrameTop 계산
-> applySlotImageTransform(image, {
     left: nextFrameLeft,
     top: nextFrameTop
   })
```

즉 겉보기에는 이미지를 끌지만, 실제로는 프레임을 이동시키는 구조입니다.

### 12-2. 슬롯 회전/리사이즈

```text
사용자 컨트롤 조작
-> Fabric modified
-> __slotImageModifiedHandler
-> 현재 frame 상태 읽기
-> applySlotImageTransform(image, {
     width,
     height,
     left,
     top,
     angle
   })
```

즉 Fabric의 중간 상태를 그대로 두지 않고 슬롯 모델에 맞게 다시 정규화합니다.

## 13. 선택 테두리와 컨트롤 보정

슬롯 이미지는 실제 이미지 외곽이 아니라 슬롯 프레임 기준으로 선택 UI가 보이도록 보정됩니다.

### 13-1. 히트영역

```text
슬롯 이미지 containsPoint()
-> isPointInsideSlotFrame()
```

즉 이미지가 프레임 밖으로 넘쳐 보여도 클릭은 프레임 안에서만 먹습니다.

### 13-2. selection area

`_pointIsInObjectSelectionArea`도 슬롯 프레임 다각형 기준으로 패치됩니다.

### 13-3. 선택 테두리

`drawBorders()`를 패치해서 실제 image bounding box가 아니라 `slotFrame*` 기준 테두리를 그립니다.

### 13-4. 컨트롤 위치

커스텀 `positionHandler`가 `slotFrameWidth/Height/Left/Top/Angle`를 읽어서 리사이즈/회전 핸들 위치를 프레임 위에 맞춰 줍니다.

결론:

```text
클릭 판정 = 프레임 기준
선택 사각형 = 프레임 기준
컨트롤 위치 = 프레임 기준
```

## 14. 일반 이미지와 슬롯 이미지의 차이

### 14-1. 일반 이미지

```text
이미지 객체 자체를 편집
-> addImage()
-> startCrop() / applyCrop()
-> cropX/cropY/width/height 중심
-> 객체 left/top 직접 이동
```

### 14-2. 슬롯 이미지

```text
프레임 + 프레임 안 이미지 상태를 편집
-> replaceSlotImage()
-> applySlotImageTransform()
-> slotFrame* + slotImage* 중심
-> 프레임 이동 + 내부 시점 이동
```

핵심 차이:

- 일반 이미지 = 객체 자체 편집
- 슬롯 이미지 = 프레임 기준 viewport 편집

## 15. 슬롯 상태값은 언제 생기고 언제 갱신되는가

### 15-1. `slot`

생성:

- `addSlotRect()`
- `convertActiveRectToSlot()`
- 템플릿 JSON 로드
- `replaceSlotImage()` 시 기존 slot 메타 복사

갱신:

- 이미지 채우면 `filled: true`
- placeholder 복원하면 `filled: false`

### 15-2. `slotFrameWidth/Height/Left/Top/Angle`

처음 생성:

- `applySlotImageTransform()`가 새 슬롯 이미지를 세팅할 때

갱신:

- 슬롯 이미지 교체
- 슬롯 전체 이동
- 슬롯 회전
- 슬롯 리사이즈

### 15-3. `slotImageBaseScale`

처음 생성:

- `applySlotImageTransform()` 내 `cover` 계산 시

갱신:

- 새 이미지 교체
- 프레임 크기 변경
- 원본 이미지 변경
- 레거시 상태 복원

### 15-4. `slotZoomScale`

초기값:

- `100`

갱신:

- `updateSlotImageScale()`

### 15-5. `slotImageOffsetX / slotImageOffsetY`

초기값:

- `0, 0`

갱신:

- `updateSlotImagePosition()`

## 16. history 저장과 복원

슬롯 관련 값은 `saveHistory()`와 `exportIntersectedJSON()`에 모두 포함됩니다.

저장 대상:

- `slot`
- `slotZoomScale`
- `slotFrameWidth`
- `slotFrameHeight`
- `slotFrameLeft`
- `slotFrameTop`
- `slotFrameAngle`
- `slotImageBaseScale`
- `slotImageOffsetX`
- `slotImageOffsetY`

즉 undo/redo 시 복원되는 것은 단순한 모양이 아니라:

- 슬롯이 어디 있었는지
- 내부 이미지가 얼마나 확대되어 있었는지
- 어느 방향으로 밀려 있었는지

까지 포함합니다.

복원 흐름:

```text
undo / redo
-> canvas.loadFromJSON(savedState)
-> finalizeLoadedCanvas()
-> useFabricSlot의 object:added 동기화
-> 슬롯 behavior / hit area / clipPath / 선택 보정 재부착
```

## 17. 슬롯 복사 정책

현재 슬롯은 복사/붙여넣기가 금지되어 있습니다.

`copy()`는 다음 경우 바로 return 합니다.

- activeObject가 슬롯인 경우
- activeObjects에 슬롯이 포함된 경우

즉 현재 구조에서는 슬롯 복제를 안전하게 지원하지 않고 있습니다.

## 18. 전체 시스템 요약 다이어그램

```text
빈 슬롯 생성
-> Rect + slot 메타

빈 슬롯 클릭
-> 파일 선택
-> replaceSlotImage()
-> applySlotImageTransform()
-> 슬롯 이미지 생성

채워진 슬롯 클릭
-> TemplateImagePanel 진입

TemplateImagePanel 편집
-> updateSlotImagePosition()
-> updateSlotImageScale()
-> applySlotImageTransform()

캔버스 직접 조작
-> moving / modified
-> applySlotImageTransform()

저장
-> saveHistory()

복원
-> loadFromJSON()
-> 슬롯 behavior 재부착
```

## 19. 최종 한 줄 정리

슬롯 시스템은 "이미지 객체를 편집하는 기능"이 아니라, "프레임 상태와 프레임 안의 이미지 상태를 따로 관리한 뒤 `applySlotImageTransform()`으로 합성 렌더링하는 시스템"입니다.
