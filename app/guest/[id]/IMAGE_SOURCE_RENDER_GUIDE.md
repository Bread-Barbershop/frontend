# 게스트/프리뷰 이미지 렌더링 가이드 (초보 개발자용)

이 문서는 **게스트 페이지와 프리뷰 컴포넌트에서 이미지를 안전하게 렌더링하는 방법**을 설명합니다.

핵심은 간단합니다.

- 이미지 원본 값은 여러 형태로 들어올 수 있습니다. (`File`, 일반 URL 문자열, Google Drive 파일 ID)
- 화면 렌더링 직전에 이 값을 **항상 렌더 가능한 `src` 문자열로 변환**해야 합니다.
- 이 변환은 이미 만들어둔 유틸/훅으로 통일해서 처리합니다.

---

## 1) 왜 이 방식이 필요한가요?

게스트/프리뷰에서 이미지가 깨지는 가장 흔한 이유는 입력 데이터 형태가 제각각이기 때문입니다.

예를 들어:

1. 에디터에서 막 업로드한 이미지 → `File`
2. 외부 이미지 주소 → `https://...`
3. 저장된 Drive 자산 → `"1AbCdEf..."` 같은 파일 ID 문자열

`<img src="..." />` 또는 `next/image`는 최종적으로 **문자열 URL**이 필요합니다.
그래서 렌더 전에 변환 규칙을 한곳으로 모아야 합니다.

---

## 2) 어떤 유틸/훅을 쓰면 되나요?

### A. `resolveDriveImageSource(source, v?)`

- 위치: `shared/utils/media/driveImageUtils.ts`
- 역할: 문자열 소스 1개를 렌더 가능한 URL로 변환

변환 순서:

1. `http://` 또는 `https://` 절대 URL이면 그대로 사용
2. Drive 파일 ID 형태면 `https://drive.google.com/uc?export=download&id=...` 형태로 변환
3. 둘 다 아니면 원본 문자열 유지

> 문자열 기반 소스를 단일 처리할 때 사용하면 됩니다.

### B. `useResolvedImageSource(source, v?)`

- 위치: `shared/hooks/useResolvedImageSource.ts`
- 역할: **단일 이미지**를 렌더 가능한 문자열로 반환

처리 방식:

- `File`이면 `URL.createObjectURL` 생성
- 컴포넌트 정리(cleanup) 시 `URL.revokeObjectURL`로 메모리 해제
- 문자열이면 `resolveDriveImageSource`로 변환

> 프로필/대표 이미지처럼 한 장만 다룰 때 적합합니다.

### C. `useResolvedImageSources(sources, v?)`

- 위치: `shared/hooks/useResolvedImageSources.ts`
- 역할: **여러 이미지 배열**을 렌더 가능한 문자열 배열로 반환

처리 방식:

- 배열을 순회하면서 각 항목 처리
- `File`은 object URL 생성 후 cleanup에서 revoke
- 문자열은 `resolveDriveImageSource`로 변환

> 갤러리처럼 여러 장 렌더링할 때 사용합니다.

---

## 3) 언제 어떤 훅을 선택하면 되나요?

- 이미지 1장: `useResolvedImageSource`
- 이미지 여러 장: `useResolvedImageSources`
- 이미 문자열만 다루는 순수 유틸 함수 필요: `resolveDriveImageSource`

헷갈리면 이 규칙 하나만 기억하세요.

> **컴포넌트에서 바로 `File | string`을 렌더하려고 하지 말고, 훅으로 먼저 `string src`를 만든 뒤 렌더한다.**

---

## 4) 실제 적용 예시

### 예시 1) 단일 이미지

```tsx
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

function Poster({ image }: { image: File | string | null }) {
  const src = useResolvedImageSource(image);

  if (!src) return null;
  return <img src={src} alt="poster" />;
}
```

### 예시 2) 다중 이미지 (갤러리)

```tsx
import { useResolvedImageSources } from '@/shared/hooks/useResolvedImageSources';

function Gallery({ images }: { images: Array<File | string> }) {
  const preview = useResolvedImageSources(images);

  if (preview.length === 0) return <div>이미지가 없습니다.</div>;

  return (
    <ul>
      {preview.map((src, i) => (
        <li key={`${src}-${i}`}>
          <img src={src} alt={`gallery-${i}`} />
        </li>
      ))}
    </ul>
  );
}
```

---

## 5) 자주 하는 실수

1. `Drive 파일 ID`를 URL로 바꾸지 않고 그대로 `src`에 넣음
   - 결과: 이미지 로드 실패

2. `File` object URL을 만들고 해제(revoke)하지 않음
   - 결과: 메모리 누수 가능
   - 훅을 사용하면 cleanup이 자동으로 처리됩니다.

3. 컴포넌트마다 변환 로직을 중복 작성
   - 결과: 버그/규칙 불일치
   - 공통 유틸/훅으로 통일하세요.

4. 배열 렌더링에서 원본 입력값을 직접 사용
   - 결과: `File`이 포함된 경우 렌더 실패 가능
   - 항상 `useResolvedImageSources` 결과를 사용하세요.

---

## 6) 추천 체크리스트

새로운 게스트/프리뷰 컴포넌트를 만들 때 아래만 확인하면 됩니다.

1. 이미지 입력 타입이 `File | string | null`(또는 배열)인지
2. 렌더 전에 `useResolvedImageSource(s)`를 거치는지
3. 빈 값(`null`, `undefined`, 빈 배열) UI 처리가 있는지
4. Drive ID, URL, File 케이스를 모두 테스트했는지

---

## 7) 참고 파일

- `shared/utils/media/driveImageUtils.ts`
- `shared/hooks/useResolvedImageSource.ts`
- `shared/hooks/useResolvedImageSources.ts`
- `components/organisms/gallery/GalleryPreview.tsx` (다중 이미지 적용 사례)
