# Component 제작 가이드 (Registry 패턴 사용 가이드)

## 1. 컴포넌트 정의

- `edit` 컴포넌트와 `preview` 컴포넌트를 만듭니다.
- **예시 (Gallery)**:
  - Edit: [Gallery.tsx](file:///c:/Users/tampl/Desktop/frontend/components/organisms/gallery/Gallery.tsx)
  - Preview: [GalleryPreview.tsx](file:///c:/Users/tampl/Desktop/frontend/components/organisms/gallery/GalleryPreview.tsx)

## 2. 컴포넌트 데이터 정의

- 컴포넌트의 데이터를 정의합니다.
- 1.  **definition** 파일을 만듭니다. (컴포넌트 연결)
  - **예시**: [Gallery.definition.ts](file:///c:/Users/tampl/Desktop/frontend/components/organisms/gallery/Gallery.definition.ts)
- 2.  **schema** 파일을 만듭니다. (데이터 구조 및 기본값)
  - **예시**: [Gallery.schema.ts](file:///c:/Users/tampl/Desktop/frontend/components/organisms/gallery/Gallery.schema.ts)
  - 타입(Template)이 필요한 경우 [shared/data/template/componentTemplate.ts](file:///c:/Users/tampl/Desktop/frontend/shared/data/template/componentTemplate.ts)에 먼저 정의합니다.
  - **주의**: scheme에 값을 넣을 때, 필수로 값이 필요한 경우 `required: true`로 설정하고, 기본값을 설정하지 않으면 `required: false`로 설정해야 합니다. 이 값은 타입 추론 시 옵셔널로 사용할 수 있게하는 역할을 합니다.
  - **주의**: 기본값을 설정할 때, 필수로 기본 값이 필요한 경우 의미있는 값을 넣고, 필요하지 않은 경우 타입 추론을 위한 값을 넣습니다.
    - **예시**: `title` : `''` => 초기 값을 빈 문자열로 넣고 placeholder를 설정합니다.

## 3. Registry 등록

- 1.  **Master Schema 등록**: [shared/data/registry/block.schema.ts](file:///c:/Users/tampl/Desktop/frontend/shared/data/registry/block.schema.ts)에 각 컴포넌트의 schema를 임포트하여 등록합니다.
- 2.  **Registry 등록**: [shared/data/registry/registry.ts](file:///c:/Users/tampl/Desktop/frontend/shared/data/registry/registry.ts)에 schema와 definition을 결합하여 등록합니다.
- 3.  **컴포넌트 정보 매칭**: [shared/data/componentsInfo/componentsInfo.ts](file:///c:/Users/tampl/Desktop/frontend/shared/data/componentsInfo/componentsInfo.ts)에 정의된 `component` 값과 `registry.ts`의 key값을 일치시킵니다.

**Store 수정 시 주의 사항**

- `useEditorStore.ts`에서 `blockSlice`, `imageSlice`, `uiSlice`를 분리했습니다.
- 각각 block컴포넌트의 CRUD, image컴포넌트의 데이터 관리, ui의 상태 관리를 담당합니다.
- **주요 타입 정의**: 전체 스토어 상태(`EditorState`) 및 각 슬라이스의 인터페이스는 [shared/types/block.ts](file:///c:/Users/tampl/Desktop/frontend/shared/types/block.ts)에서 관리합니다. 새로운 기능을 추가할 때 해당 파일의 타입을 먼저 업데이트해 주세요.

**Preview와 Edit 컴포넌트 데이터 동기화 가이드**

- **Preview**의 경우 `blockInfo`, `className`, `titleClassName`, `onClick`을 Props로 받아야 합니다.
  - `blockInfo`: 컴포넌트의 데이터를 정의합니다. (PropsFromFields 타입 활용)
  - `className`: 컴포넌트의 가변적인 스타일을 정의합니다.
  - `titleClassName`: 컴포넌트 제목의 색상 등을 정의합니다.
  - `onClick`: 에디터에서 컴포넌트를 클릭했을 때 선택 상태로 만들기 위한 함수입니다. 컴포넌트 최상단 div에 적용해 주세요.
- **Edit**의 경우 `blockInfo`, `id`를 Props로 받아야 합니다.
  - `blockInfo`: 현재 선택된 블록의 데이터를 정의합니다.
  - `id`: 데이터를 업데이트할 때 식별자로 사용합니다.
