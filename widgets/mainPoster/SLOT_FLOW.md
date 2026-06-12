# Poster Template Slot Flow

이 문서는 `widgets/mainPoster`에서 동작하는 "포스터 템플릿 슬롯 교체" 흐름을 코드 기준으로 설명합니다.

## 1. 먼저 큰 구조부터 이해하기

이 기능의 핵심 목표는 이것입니다.

1. 템플릿 JSON 안에 "여기는 사용자가 사진을 바꿀 수 있는 자리"를 만든다.
2. 그 JSON을 Fabric 캔버스로 불러온다.
3. 사용자가 그 자리를 클릭하면 사진을 업로드할 수 있게 한다.
4. 업로드한 사진을 기존 슬롯의 위치와 크기에 맞춰 끼워 넣는다.
5. 사진이 들어간 뒤에도 그 객체를 계속 "슬롯 이미지"로 취급해서 위치 조절 등을 가능하게 한다.

즉, "일반 이미지 업로드"와 "템플릿 슬롯 교체"는 겉보기엔 비슷하지만 내부 역할이 다릅니다.

## 2. 슬롯 정보는 어디에 저장되는가

슬롯 여부는 별도의 전역 배열이나 매핑 테이블로 관리하지 않습니다.

대신 Fabric 객체 자체에 `slot`이라는 메타데이터를 붙여서 관리합니다.

관련 파일:

- [widgets/mainPoster/utils/imageSlot.ts](/C:/bread-barbershop/frontend/widgets/mainPoster/utils/imageSlot.ts)

여기서 핵심 타입은 `ImageSlotMeta`입니다.

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

각 필드의 의미:

- `key`: 슬롯 고유 식별자
- `replaceable`: 사용자 사진으로 교체 가능한 슬롯인지
- `aspectMode`: 사진을 슬롯에 채우는 방식
- `filled`: 현재 사진이 이미 들어가 있는지

즉, 이 프로젝트에서 "슬롯이다"라는 뜻은 보통 이런 조건으로 판단합니다.

```ts
slot?.replaceable === true && slot.key가 존재함
```

## 3. JSON을 불러오면 왜 바로 속성 검사가 가능한가

관련 파일:

- [widgets/mainPoster/components/MainPosterPreview.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)

`MainPosterPreview`에서는 `initialData`를 받아 Fabric 캔버스에 올립니다.

핵심 부분:

```ts
const jsonData =
  typeof initialData === 'string' ? JSON.parse(initialData) : initialData;

await canvas.loadFromJSON(jsonData);
```

이 시점 이후에는 JSON 안의 각 object가 단순한 JSON 데이터가 아니라 Fabric 객체가 됩니다.

예를 들어:

- rect는 `Rect`
- image는 `FabricImage`
- text는 `Textbox`, `IText`

로 바뀝니다.

그래서 사용자가 어떤 객체를 클릭하면, Fabric은 그 객체를 `activeObject`로 잡아주고, 우리는 그 객체에 대해 바로 이런 접근을 할 수 있습니다.

```ts
activeObj.get('id');
activeObj.get('name')(activeObj as SlotTargetObject).slot;
```

즉, `loadFromJSON()` 이후에는 "JSON을 다시 찾아보는 방식"이 아니라 "현재 선택된 Fabric 객체를 직접 검사하는 방식"으로 동작합니다.

## 4. 슬롯인지 아닌지는 어떻게 판별하는가

관련 파일:

- [widgets/mainPoster/utils/imageSlot.ts](/C:/bread-barbershop/frontend/widgets/mainPoster/utils/imageSlot.ts)

핵심 함수는 `getSlotMeta()`입니다.

```ts
export const getSlotMeta = (target: unknown) => {
  if (!(target instanceof FabricObject)) {
    return null;
  }

  const slot = (target as SlotTargetObject).slot;
  if (!slot?.replaceable || !slot.key) {
    return null;
  }

  return slot;
};
```

이 함수는 이렇게 동작합니다.

1. 먼저 Fabric 객체인지 확인
2. `slot` 속성이 있는지 확인
3. `replaceable`이 true인지 확인
4. `key`가 있는지 확인
5. 모두 만족하면 "이건 슬롯"이라고 판단

이를 바탕으로 아래 함수들이 만들어집니다.

- `isReplaceableSlotTarget()`
- `isReplaceableSlotImage()`
- `isFilledSlotImage()`

정리하면:

- 슬롯 placeholder rect도 슬롯일 수 있음
- 슬롯으로 교체된 image도 슬롯일 수 있음
- 다만 image인지 rect인지에 따라 후속 UI는 달라짐

## 5. 슬롯 사각형은 어떻게 만들어지는가

관련 파일:

- [widgets/mainPoster/hooks/useFabricSlot.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/hooks/useFabricSlot.tsx)

### 5-1. 먼저 일반 사각형처럼 보이는 슬롯 박스를 추가

`addSlotRect()`는 모자이크 패턴이 들어간 `Rect`를 하나 생성합니다.

```ts
const rect = new Rect({
  left: canvas.width ? canvas.width / 2 : 160,
  top: canvas.height ? canvas.height / 2 : 190,
  width: 120,
  height: 180,
  fill: createSlotPattern(),
  selectable: true,
  evented: true,
  hasControls: true,
  originX: 'center',
  originY: 'center',
});
```

이 시점에는 아직 "그냥 사각형"에 가깝습니다.

### 5-2. 우클릭 액션으로 슬롯 메타데이터 부여

`convertActiveRectToSlot()`이 호출되면 현재 선택된 rect에 `slot` 정보를 심습니다.

```ts
rect.set({
  id: rect.get('id') || slotKey,
  name: 'slot-placeholder',
  fill: createSlotPattern(),
  stroke: null,
  strokeWidth: 0,
  strokeDashArray: null,
  slot: {
    key: slotKey,
    label: `Photo Slot ${Date.now()}`,
    replaceable: true,
    aspectMode: 'cover',
    required: false,
    order: 1,
    filled: false,
  },
});
```

이 순간부터 이 rect는 "사진 슬롯"이라는 정체성을 갖게 됩니다.

중요한 점:

- `name: 'slot-placeholder'`는 어드민 UI 판별에 사용됨
- `slot.replaceable: true`는 사용자 교체 가능 여부의 핵심
- `filled: false`는 아직 사진이 안 들어갔음을 의미

## 6. 이 정보는 JSON에 어떻게 남는가

관련 파일:

- [widgets/mainPoster/hooks/useFabric.ts](/C:/bread-barbershop/frontend/widgets/mainPoster/hooks/useFabric.ts)

히스토리 저장과 JSON 추출 시 `slot` 속성을 함께 직렬화하고 있습니다.

예를 들어 `saveHistory()` 안에서:

```ts
canvas.toObject([
  ...,
  'slot',
])
```

또 `exportIntersectedJSON()`에서도:

```ts
const propertiesToInclude = [
  ...,
  'slot',
];
```

그래서 슬롯 메타데이터는:

1. 캔버스 안에서만 잠깐 존재하는 값이 아니고
2. JSON으로 저장될 때도 같이 나가고
3. 나중에 다시 `loadFromJSON()`할 때도 복원됩니다

즉, JSON과 슬롯의 연결은 별도 테이블이 아니라 객체 내부의 `slot` 속성으로 유지됩니다.

## 7. 클릭했을 때 어떤 패널이 열릴지 누가 결정하는가

관련 파일:

- [widgets/mainPoster/components/MainPosterPreview.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)
- [widgets/mainPoster/components/MainPoster.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/components/MainPoster.tsx)

`MainPosterPreview` 안의 `handleSelection()`에서 현재 선택된 객체 타입과 역할을 보고 `activeTab`을 바꿉니다.

핵심 분기:

```ts
if (isActiveText) {
  setActiveTab('text');
} else if (isReplaceableSlotImage(activeObj)) {
  setActiveTab('template');
} else if (isActiveImage || isCropZone) {
  setActiveTab('image');
} else if (
  isAdmin &&
  activeObj.get('name') === 'slot-placeholder' &&
  !(activeObj instanceof FabricImage)
) {
  setActiveTab('slot');
} else if (isActiveShape && isAdmin) {
  setActiveTab('shape');
} else {
  setActiveTab('background');
}
```

이 코드가 의미하는 것:

- 텍스트면 `text`
- 슬롯 이미지면 `template`
- 일반 이미지면 `image`
- 어드민이 보는 빈 슬롯 rect면 `slot`
- 일반 도형이면 `shape`
- 그 외는 `background`

그리고 `MainPoster.tsx`에서 `activeTab` 값에 따라 실제 패널 컴포넌트를 렌더링합니다.

예:

- `template`면 `TemplateImagePanel`
- `slot`이면 `SlotPanel`
- `image`면 `ImagePanel`

## 8. 파일 선택창은 슬롯마다 하나씩 있는가

아닙니다.

관련 파일:

- [widgets/mainPoster/components/MainPosterPreview.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)

숨겨진 파일 input은 하나만 있습니다.

```tsx
<input
  ref={slotInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  ...
/>
```

즉 구조는:

- 슬롯 A 아래에 input 하나
- 슬롯 B 아래에 input 하나
- 슬롯 C 아래에 input 하나

가 아니라,

- 공용 input 하나
- 어떤 슬롯을 눌렀는지만 따로 기억

하는 방식입니다.

## 9. 클릭한 슬롯을 왜 `pendingSlotRef`에 저장하는가

관련 파일:

- [widgets/mainPoster/components/MainPosterPreview.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)

핵심 코드:

```ts
const pendingSlotRef = useRef<SlotTargetObject | null>(null);

const openSlotFilePicker = (target: SlotTargetObject) => {
  pendingSlotRef.current = target;
  slotInputRef.current?.click();
};
```

이걸 이해하려면 파일 업로드가 비동기라는 점을 알아야 합니다.

실제 흐름:

1. 사용자가 슬롯을 클릭
2. 파일 선택창이 열림
3. 사용자는 몇 초 뒤 파일을 선택
4. 그때서야 `input onChange`가 실행됨

문제는 4번 시점에는 "처음 어떤 슬롯을 눌렀는지"를 브라우저가 자동으로 기억해주지 않는다는 것입니다.

그래서 클릭 순간의 슬롯 객체를 `pendingSlotRef`에 저장합니다.

### 예시 시나리오

슬롯이 3개 있다고 가정:

- A: 메인 사진
- B: 신랑 사진
- C: 신부 사진

사용자가 B를 클릭해서 파일창을 열었는데, 만약 `pendingSlotRef`가 없다면:

1. 나중에 파일이 들어왔을 때
2. 그 파일을 어느 슬롯에 넣어야 하는지 알 수 없고
3. 현재 활성 객체가 바뀌어 있으면 잘못된 슬롯에 들어갈 수도 있습니다

반대로 `pendingSlotRef`가 있으면:

1. B를 클릭한 순간 `pendingSlotRef.current = B`
2. 파일이 나중에 들어와도 대상은 여전히 B
3. 정확한 슬롯에 이미지를 넣을 수 있음

즉 `pendingSlotRef`는 "이번 업로드의 목적지"를 임시로 저장하는 메모장 역할을 합니다.

## 10. 슬롯을 클릭했을 때 언제 파일 선택창이 열리는가

관련 파일:

- [widgets/mainPoster/components/MainPosterPreview.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)

`mouse:up` 이벤트에서 슬롯 여부를 검사합니다.

```ts
if (isReplaceableSlotTarget(options.target)) {
  fabricCanvas.setActiveObject(options.target);
  setActiveTab(options.target instanceof FabricImage ? 'template' : 'slot');

  if (!isAdmin && !isFilledSlotImage(options.target)) {
    openSlotFilePicker(options.target);
  }
}
```

이 뜻은:

1. 클릭한 대상이 슬롯이면
2. 그 객체를 active object로 잡고
3. 탭을 적절히 바꾸고
4. 어드민이 아니고
5. 아직 사진이 안 채워진 슬롯이면
6. 파일 선택창을 연다

즉:

- 사용자 모드에서만 자동 업로드 열림
- 어드민 모드에서는 안 열림
- 이미 사진이 들어간 슬롯 이미지는 다시 자동 업로드를 띄우지 않음

## 11. 사용자가 고른 파일은 실제로 어디서 처리되는가

관련 파일:

- [widgets/mainPoster/components/MainPosterPreview.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/components/MainPosterPreview.tsx)

숨겨진 input의 `onChange`가 처리합니다.

```ts
onChange={async event => {
  const file = event.target.files?.[0];
  const slotTarget = pendingSlotRef.current;
  event.target.value = '';

  if (!file || !canvas || !slotTarget) return;

  const reader = new FileReader();
  reader.onload = async loadEvent => {
    const base64 = loadEvent.target?.result;
    if (typeof base64 !== 'string') return;

    const compressed = await compressImage(base64);
    await replaceSlotImage(slotTarget, compressed);
    pendingSlotRef.current = null;
  };
  reader.readAsDataURL(file);
}}
```

순서대로 보면:

1. 선택한 파일을 가져옴
2. 아까 저장해둔 슬롯 객체를 가져옴
3. 파일을 base64로 읽음
4. 이미지를 압축함
5. `replaceSlotImage(slotTarget, compressed)` 실행
6. 업로드 목적지 ref를 비움

## 12. 실제 슬롯 이미지 교체는 어디서 일어나는가

관련 파일:

- [widgets/mainPoster/hooks/useFabricSlot.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/hooks/useFabricSlot.tsx)

핵심 함수는 `replaceSlotImage()`입니다.

```ts
const replaceSlotImage = async (
  targetImage: FabricObject,
  url: string
) => {
  ...
}
```

이 함수는:

- 기존 슬롯 객체
- 새 이미지 URL

을 받아서 새 `FabricImage`를 만들고 기존 슬롯 자리에 끼워 넣습니다.

### 12-1. 기존 슬롯의 자리 정보 기억

```ts
const objectIndex = canvas.getObjects().indexOf(targetImage);
const frameWidth = targetImage.getScaledWidth();
const frameHeight = targetImage.getScaledHeight();
const slot = ((targetImage as SlotTargetObject).slot || {}) as ImageSlotMeta;
```

여기서 기억하는 값:

- 캔버스 순서
- 슬롯의 화면상 너비/높이
- 기존 슬롯 메타데이터

### 12-2. 새 이미지 로드

```ts
const nextImage = await FabricImage.fromURL(url, {
  crossOrigin: 'anonymous',
});
```

### 12-3. 원본 비율과 슬롯 비율 비교

```ts
const frameAspect = frameWidth / frameHeight;
const sourceAspect = sourceWidth / sourceHeight;
```

- `frameAspect`: 슬롯의 비율
- `sourceAspect`: 업로드한 사진의 원본 비율

### 12-4. `cover` 방식으로 보일 영역 계산

```ts
if ((slot.aspectMode ?? 'cover') === 'cover') {
  if (sourceAspect > frameAspect) {
    cropWidth = sourceHeight * frameAspect;
    cropX = (sourceWidth - cropWidth) / 2;
  } else {
    cropHeight = sourceWidth / frameAspect;
    cropY = (sourceHeight - cropHeight) / 2;
  }
}
```

의미:

- 사진이 너무 가로로 길면 좌우를 자름
- 사진이 너무 세로로 길면 위아래를 자름
- 대신 슬롯은 빈 공간 없이 꽉 채움

즉 CSS의 `cover`와 비슷한 생각입니다.

### 12-5. 기존 슬롯의 위치와 상태를 새 이미지에 복사

```ts
nextImage.set({
  id: targetImage.get('id'),
  slot: {
    ...slot,
    filled: true,
  },
  left: targetImage.left,
  top: targetImage.top,
  originX: targetImage.originX,
  originY: targetImage.originY,
  angle: targetImage.angle,
  ...cropX,
  cropY,
  width: cropWidth,
  height: cropHeight,
  scaleX: frameWidth / cropWidth,
  scaleY: frameHeight / cropHeight,
});
```

핵심 포인트:

- 위치 유지
- 회전 유지
- 보이는 크기 유지
- 슬롯 메타데이터 유지
- `filled: true`로 변경

즉 슬롯 rect가 슬롯 image로 바뀌더라도 "같은 슬롯"이라는 정체성은 이어집니다.

### 12-6. 기존 객체 제거 후 같은 자리에 새 이미지 삽입

```ts
canvas.remove(targetImage);
canvas.insertAt(objectIndex, nextImage);
canvas.setActiveObject(nextImage);
```

즉 내부적으로는:

- 기존 슬롯 제거
- 새 이미지 삽입

이지만, 사용자는 같은 자리에 사진이 바뀐 것처럼 느끼게 됩니다.

## 13. 사진이 들어간 뒤에도 왜 계속 슬롯으로 동작하는가

이 부분이 매우 중요합니다.

슬롯 이미지를 계속 슬롯으로 취급할 수 있는 이유는 새 이미지에도 `slot` 메타데이터를 복사하기 때문입니다.

```ts
slot: {
  ...slot,
  filled: true,
},
```

그래서 교체 후에도:

- `isReplaceableSlotImage()`가 true가 되고
- `TemplateImagePanel`이 열릴 수 있고
- x/y 조절도 가능해집니다

즉 "모양은 image가 되었지만 역할은 계속 slot"입니다.

## 14. 슬롯 이미지의 x/y 조절은 어떻게 동작하는가

관련 파일:

- [widgets/mainPoster/hooks/useFabricSlot.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/hooks/useFabricSlot.tsx)
- [widgets/mainPoster/components/image/TemplateImagePanel.tsx](/C:/bread-barbershop/frontend/widgets/mainPoster/components/image/TemplateImagePanel.tsx)

여기서 중요한 점은 이미지 객체 자체를 슬롯 밖으로 움직이는 것이 아니라, 이미지 안에서 "어느 구간을 보여줄지"를 움직인다는 것입니다.

### 14-1. 현재 위치를 퍼센트 값으로 계산

`getSlotImagePosition()`은 현재 `cropX`, `cropY`를 UI용 퍼센트 값으로 바꿉니다.

```ts
return {
  x: maxCropX === 0 ? 50 : (image.cropX / maxCropX) * 100,
  y: maxCropY === 0 ? 50 : (image.cropY / maxCropY) * 100,
  canMoveX: maxCropX > 0,
  canMoveY: maxCropY > 0,
};
```

### 14-2. 슬라이더 값을 다시 `cropX`, `cropY`로 환산

`updateSlotImagePosition()`은 퍼센트를 실제 crop 값으로 바꿉니다.

```ts
if (axis === 'x' && maxCropX > 0) {
  image.set({ cropX: (maxCropX * normalized) / 100 });
}

if (axis === 'y' && maxCropY > 0) {
  image.set({ cropY: (maxCropY * normalized) / 100 });
}
```

즉 사용자는 사진을 좌우/상하로 옮기는 것처럼 느끼지만, 실제로는 "슬롯 안에서 보여주는 원본 이미지 구간"을 바꾸는 것입니다.

## 15. 왜 일반 이미지 패널과 슬롯 이미지 패널을 분리했는가

현재 구조에서는:

- 일반 이미지: `ImagePanel`
- 슬롯 이미지: `TemplateImagePanel`
- 빈 슬롯 rect: `SlotPanel`

으로 나뉩니다.

이렇게 분리한 이유:

1. 일반 이미지는 자유 크롭이 중심
2. 슬롯 이미지는 슬롯 내부 crop 이동이 중심
3. 빈 슬롯 rect는 업로드 대상 정의가 중심

즉 "모양이 이미지다"라는 이유만으로 같은 패널을 쓰면 역할이 뒤섞여 버그가 생기기 쉬워집니다.

## 16. 전체 흐름을 아주 짧게 요약하면

1. 어드민이 rect를 만들고 슬롯 메타데이터를 붙인다.
2. 그 정보는 JSON의 각 객체 안에 `slot`으로 저장된다.
3. JSON을 `loadFromJSON()`으로 읽으면 다시 Fabric 객체가 된다.
4. 사용자가 슬롯을 클릭하면 현재 객체의 `slot`을 검사해서 슬롯인지 확인한다.
5. 클릭 순간 그 슬롯 객체를 `pendingSlotRef`에 저장한다.
6. 공용 파일 input을 연다.
7. 사용자가 사진을 고르면 `replaceSlotImage()`가 실행된다.
8. 새 이미지를 기존 슬롯 위치와 비율에 맞춰 교체한다.
9. 새 이미지에도 `slot` 메타데이터를 유지해서 계속 슬롯으로 취급한다.
10. 이후에는 `TemplateImagePanel`에서 보이는 위치를 x/y로 조절할 수 있다.
