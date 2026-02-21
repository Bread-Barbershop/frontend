# 🚀 Fabric.js 및 상태 관리 리팩토링 상세 보고서

본 문서는 Fabric.js 캔버스 상태 분리 및 기능 복원, 버그 수정 등 지금까지 진행된 **모든 리팩토링 및 개선 사항**을 상세하게 기록한 문서입니다.

---

## 1. 전역 상태(Zustand) 의존성 분리 및 최적화

기초적인 상태 관리 구조를 개편하여, 무거운 `Fabric.Object`가 React 리렌더링 주기에 불필요하게 개입하는 문제를 해결했습니다.

- **`useEditorStore` (Zustand) 정리**
  - 기존에 전역으로 관리되던 `canvas`, `setCanvas`, `activeObject`, `setActiveObject` 상태를 완전히 제거했습니다.
  - Zustand에는 오직 UI의 관리를 위한 가벼운 상태(`activeTab` 등)만 남겨두어 전역 스토어를 가볍게 유지했습니다.
- **`FabricContext` 및 `useFabric`으로 관심사 이동**
  - `canvas` 객체와 관련된 상태 및 로직을 모두 `useFabric` 내부로 통합하고, `FabricContext`를 통해 하위 컴포넌트에 공급하도록 구조를 개편했습니다.
- **안전한 데이터 추출 (`activeInfo`) 도입**
  - 전체 원본 객체(`activeObject`) 대신, UI에서 렌더링에 필요한 최소한의 데이터(ex. `styles`, `filters`, `type` 등)만 추출한 `activeInfo` 상태를 새로 도입했습니다.
  - 이를 통해 텍스트 패널이나 속성 패널이 불필요하게 리렌더링 되거나 에러가 발생하는 현상을 방지했습니다.

---

## 2. Prop Drilling(속성 내리물림) 해소 및 하위 컴포넌트 정리

상위 컴포넌트에서 자식 컴포넌트로 함수나 객체를 계속 전달하던 비효율적인 구조를 제거했습니다. 각 컴포넌트가 알아서 `useFabricContext`를 참조하도록 독립성을 높였습니다.

- **[Menubar], [Toolbar], [ContextMenu] 개선**
  - 상위에서 `activeObject`, `canvas`, 기능 함수(`copy`, `paste` 등)를 일일이 넘겨받지 않고, 자체적으로 Context에서 접근하게 만들었습니다.
  - 특히 컴포넌트가 너무 비대했던 `ContextMenu` 내부의 `CopyAndPaste`, `ControlZindex` 등의 자식 컴포넌트들도 props 없이 스스로 Context를 참조하도록 수정했습니다.
- **속성 패널 정리 ([RichTextPanel], [GraphicPanel], [ImagePanel])**
  - 속성 패널 내부의 `FontFamily`, `FontSize`, `FontColor` 모두 `activeInfo.styles` 값을 파생 상태로 직관적으로 사용하도록 변경했습니다.
  - `useEffect` 안에서 무거운 `setState`를 연쇄 호출함으로써 일어나던 React Cascade Update 에러들을 깔끔하게 해결했습니다.

---

## 3. 손실된 키보드 및 마우스 이벤트 완벽 복원

상태 관리 구조를 변경하면서 끊어졌던 캔버스 인터랙션(이벤트 리스너)을 복원하고 버그를 예방했습니다.

- **단축키 복원 (`PosterEditor.tsx` 내 `useEffect`)**
  - **복사 및 붙여넣기 (Ctrl+C / Ctrl+V)**: `useFabric` 훅 안으로 클립보드(`clipboard`) 상태를 이동시키고 단축키로 정상 작동하도록 복원했습니다 (텍스트 내부 편집 중일 때는 외부 단축키 작동 방지 처리).
  - **도형 삭제 (Delete / Backspace)**: 단축키를 눌렀을 때 선택된 도형(`handleDeleteShape`)이 즉각 지워지도록 복원했습니다.
- **마우스 동작 제어**
  - 우클릭을 할 때 객체의 선택이 해제되거나 에러가 발생하는 문제를 막기 위해 우클릭 무시(Right Click Ignore) 처리를 다시 연결했습니다.
  - 바탕 캔버스를 클릭했을 때 `activeTab`이 해제되도록 정상적으로 연결했습니다.

---

## 4. 도형(Graphic) 및 이미지(Image) 기능 버그 픽스

기능을 테스트하는 과정에서 발견된 좌표 및 크롭 영역과 관련된 치명적인 버그들을 모두 수정했습니다.

- **도형 생성 시 마우스 싱크 문제 수정 (`useFabricGraphic.tsx`)**
  - **문제**: 드래그해서 도형을 생성할 때, 마우스 포인터의 위치와 실제로 그려지는 도형의 위치가 어긋남.
  - **원인**: Fabric.js의 도형 중심점(Origin)이 기본값('center') 등으로 틀어져 생성되었기 때문.
  - **해결**: 모든 도형(`Rect`, `Circle`, `Triangle`)이 정확하게 위치에 맞춰 생성될 수 있도록 `originX: 'left'`, `originY: 'top'` 속성을 명시적으로 주입했습니다.
- **이미지 크롭 모드 기능 고도화 (`useFabricImage.tsx`)**
  - **더블 클릭 크롭 진입 복원**: 이미지를 더블 클릭했을 때 크롭 모드(`startCrop`)로 들어가는 인터랙션을 `PosterEditor`에 복구했습니다.
  - **크롭 영역 초기화 크기 비율 문제 해결**:
    - **문제**: 크롭 된 이미지를 더블클릭하면 0.7 크기로 작아져버림.
    - **해결**: 해당 이미지가 이전에 크롭된 이력이 있는지 파악성(`img.cropX > 0` 등)을 체크하여, **처음 자를 때는 화면 크기의 0.7비율**, **이후 진입 시에는 기존 크롭된 크기를 유지**하도록 지능적으로 계산식을 개선했습니다.
  - **이전 크롭 비율(Ratio) 메모리 기능 추가**:
    - **문제**: 1:1, 4:3 등 특정 비율로 자르고 적용한 뒤 다시 더블클릭하면 무조건 `free`(자유) 비율로 초기화 됨.
    - **해결**: 크롭을 적용할 때 적용된 비율 값을 `img.customCropRatio` 속성으로 은밀히 저장해두고, 더블클릭으로 재진입 할 때 이 비율 변수를 먼저 불러오게 하여 이전에 설정한 고정 비율 또는 자유 포커스가 그대로 유지되도록 구현했습니다.

---

## 5. TypeScript 및 ESLint 에러 정리

- 무분별한 `any` 타입 사용으로 인한 린트 경고를 해결했습니다.
  - `FabricImage` 및 `Rect` 인스턴스에 `customCropRatio` 및 `lockUniScaling` 타입 교차 부여(`intersection type`)
  - 패브릭 이벤트 객체에 `TPointerEventInfo<TPointerEvent>` 명시
  - `activeObject.isEditing`의 타입을 동적으로 단언하여 TS 에러를 안전하게 제거했습니다.

---

> 본 문서에 기재된 모든 리팩토링 및 픽스 사항은 `/widgets/mainPoster` 하위에 선반영 및 테스트가 완료되었습니다.
