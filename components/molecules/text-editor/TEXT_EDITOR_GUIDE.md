# 텍스트 에디터 사용 가이드

이 문서는 새 컴포넌트에 `TextEditor`를 붙일 때 필요한 내용만 정리합니다.

## 1. 핵심 규칙 (무엇을, 왜)

1. `messageJson`은 편집 원본으로 유지합니다.
이유: 에디터를 다시 열었을 때 정확히 복원하고 재편집하려면 JSON 구조가 필요합니다.

2. `messageHtml`은 렌더용 스냅샷으로 함께 저장합니다.
이유: 게스트/프리뷰에서 다시 변환하지 않고 바로 렌더하면 hydration mismatch를 크게 줄일 수 있습니다.

3. 입력 변경 시 `messageJson`과 `messageHtml`을 항상 같이 갱신합니다.
이유: 저장 시점마다 두 값이 어긋나지 않게 유지해야 렌더 결과와 편집 결과가 일치합니다.

4. 렌더는 `messageHtml` 우선, 없으면 JSON 변환 fallback을 사용합니다.
이유: 신규 데이터는 안정적으로 렌더하고, 구버전 데이터는 깨지지 않게 호환해야 합니다.

5. 타이핑은 디바운스, 즉시 액션은 즉시 반영합니다.
이유: 타이핑 중 과도한 상태 업데이트를 줄이되, 샘플 선택 같은 명시적 액션은 즉시 보여줘야 UX가 자연스럽습니다.

## 2. 구현 순서

1. 스키마에 `messageJson`, `messageHtml` 필드 정의
2. `onChange`에서 JSON/HTML 동시 업데이트
3. 타이핑 경로에 디바운스 적용
4. 샘플 선택 같은 즉시 액션에서 `debounce.cancel()` 후 즉시 업데이트
5. 프리뷰/게스트에서 `messageHtml` 우선 렌더 + fallback

## 3. 코드 템플릿

### 3-1) 스키마

```ts
messageJson: {
  default: null as JSONContent | null,
  required: false,
},
messageHtml: {
  default: null as string | null,
  required: false,
},
```

### 3-2) 입력 변경 처리 (디바운스)

```ts
const debouncedUpdateMessage = useMemo(
  () =>
    debounce((messageJson: JSONContent) => {
      updateBlock(id, {
        messageJson,
        messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
      });
    }, 300),
  [id, updateBlock]
);

useEffect(() => {
  return () => {
    debouncedUpdateMessage.cancel();
  };
}, [debouncedUpdateMessage]);

const handleEditorChange = (json: JSONContent) => {
  debouncedUpdateMessage(json);
};
```

### 3-3) 샘플 선택 등 즉시 반영

```ts
const handleSampleSelect = (text: string) => {
  debouncedUpdateMessage.cancel();
  const messageJson = createParagraphJson(text);

  updateBlock(id, {
    messageJson,
    messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
  });
};
```

### 3-4) 프리뷰/게스트 렌더

```ts
const html =
  blockInfo.props.messageHtml ??
  tiptapJsonToHtmlUniversal(blockInfo.props.messageJson);
```

## 4. 함수 선택 기준

1. `tiptapJsonToHtmlInBrowser`
- 브라우저 전용
- 에디터 입력 처리(`onChange`)에서 사용

2. `tiptapJsonToHtmlUniversal`
- 서버/클라이언트 공용
- 프리뷰 fallback 변환에서 사용

## 5. 자주 하는 실수

1. HTML만 저장하고 JSON을 버림
- 재편집 시 데이터 복원이 불안정해질 수 있습니다.

2. 게스트 렌더에서 매번 JSON -> HTML 변환
- SSR/hydration 환경에서 mismatch 가능성이 커집니다.

3. 즉시 액션 전에 디바운스 취소를 안 함
- 늦게 실행된 이전 타이머가 최신 상태를 덮어쓸 수 있습니다.

## 6. 체크리스트

1. 입력 시 store에 `messageJson`, `messageHtml`이 함께 갱신되는지
2. 샘플 선택 시 즉시 반영되는지
3. 저장 후 재진입해도 편집이 정상인지
4. 게스트 페이지에서 hydration mismatch 경고가 없는지
5. `npx eslint <changed-files>`, `npx tsc --noEmit` 통과 여부

## 7. 참고 파일

1. `components/molecules/text-editor/TextEditor.tsx`
2. `components/molecules/text-editor/utils/tiptapJsonToHtml.ts`
3. `shared/utils/debounce.ts`
4. `components/organisms/greeting/Greeting.schema.ts`
5. `components/organisms/greeting/Greeting.tsx`
6. `components/organisms/greeting/GreetingPreview.tsx`
