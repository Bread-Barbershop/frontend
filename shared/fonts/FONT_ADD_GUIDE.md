# Font Add Guide

# 필수 단계는 `1,2`번만 해주시면 됩니다

이 프로젝트에서 새 폰트를 추가하는 기본 흐름은 아래와 같습니다.

## 1. 폰트 파일 추가

- 폰트 파일을 `public/font` 하위에 추가합니다.
- 예시
  - `public/font/MyFont/MyFont-Regular.ttf`
  - `public/font/MyFont/MyFont-Bold.ttf`
- variable font라면 파일 1개를 두고 여러 `weight`로 매핑할 수 있습니다.

## 2. CUSTOM_FONTS 등록

- 파일: `shared/fonts/fonts.ts`
- `CUSTOM_FONTS` 배열에 새 폰트 정보를 추가합니다.
- `family` 값은 실제 `fontFamily` 값과 에디터 표시명으로 함께 사용되므로 최종 이름으로 정확히 작성해야 합니다.

예시:

```ts
{
  family: 'My Font',
  url: 'url(/font/MyFont/MyFont-Regular.ttf)',
  weight: '400',
  style: 'normal',
},
{
  family: 'My Font',
  url: 'url(/font/MyFont/MyFont-Bold.ttf)',
  weight: '700',
  style: 'normal',
},
```

### 등록 방식

- 고정 weight 폰트
  - weight별 파일을 각각 등록합니다.
- variable font
  - 같은 파일 URL을 여러 weight로 반복 등록합니다.

## 3. 기본 weight 등록

- 파일: `shared/fonts/fontRegistry.ts`
- `DEFAULT_WEIGHT_BY_FAMILY`에 기본 weight를 추가합니다.
- 선택한 폰트의 기본 굵기를 정하는 용도입니다.

예시:

```ts
const DEFAULT_WEIGHT_BY_FAMILY: Record<string, string> = {
  LINESeedKR: '400',
  Pretendard: '400',
  'My Font': '400',
};
```

## 4. fallback 확인

- 파일: `shared/fonts/fontRegistry.ts`
- 기본 fallback은 `Pretendard`입니다.
- 일반적인 신규 폰트 추가는 별도 수정 없이 `"My Font", "Pretendard", sans-serif` 형태로 동작합니다.
- 특정 fallback 정책이 필요하면 `buildFontRegistry` 또는 fallback 설정 로직을 확장합니다.

## 5. 레거시 값 매핑이 필요한지 확인

- 파일: `shared/fonts/fontRegistry.ts`
- 기존 저장 데이터가 새 폰트명을 직접 쓰지 않고 별도 토큰을 쓰는 경우 `LEGACY_FONT_TOKEN_MAP` 또는 `resolveFontFamily`를 보완해야 합니다.
- 신규 폰트를 처음 추가하는 경우에는 보통 필요하지 않습니다.

예시:

```ts
const LEGACY_FONT_TOKEN_MAP: Record<string, string> = {
  'font-myfont': 'My Font',
};
```

## 6. 에디터 노출 확인

- 폰트 선택 UI는 아래 파일들이 `FONT_REGISTRY`를 읽어 자동 생성합니다.
  - `shared/fonts/fontOptions.ts`
  - `components/molecules/text-editor/utils/textEditorOptions.ts`
- 따라서 `CUSTOM_FONTS` 등록이 올바르면 드롭다운에 자동 노출됩니다.

## 7. 템플릿/Fabric 적용 확인

- 파일: `widgets/mainPoster/hooks/useTemplate.ts`
- 템플릿 JSON 로드 시 `CUSTOM_FONTS` 기준으로 preload합니다.
- 템플릿 JSON 내부의 `fontFamily` 값은 `family`와 완전히 동일해야 합니다.

## 8. 게스트 렌더링 적용 확인

- 파일: `app/guest/[id]/components/GuestRenderer.tsx`
- 게스트 페이지는 사용 중인 폰트를 수집해서 preload합니다.
- 레지스트리 등록이 정상적이면 게스트 페이지에도 동일하게 반영됩니다.

## 체크리스트

- `public/font` 경로와 `url(...)` 경로가 정확히 일치하는지 확인
- `family` 문자열이 공백/대소문자까지 포함해 정확한지 확인
- variable font가 실제 지원하는 weight만 등록했는지 확인
- 한글 폰트라면 한글 glyph가 포함되어 있는지 확인
- 폰트 파일 용량이 너무 커서 초기 로딩에 부담이 없는지 확인

## 함께 보면 좋은 파일

- `shared/fonts/fonts.ts`
- `shared/fonts/fontRegistry.ts`
- `shared/fonts/fontOptions.ts`
- `widgets/mainPoster/utils/fontLoader.ts`
- `widgets/mainPoster/hooks/useTemplate.ts`
- `shared/utils/toStyle.ts`
- `shared/hooks/useBodyFontInfo.ts`
