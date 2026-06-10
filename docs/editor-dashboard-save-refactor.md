# 에디터 저장 및 대시보드 공개 전환 리팩토링

## 목표

에디터는 저장만 담당하고, 초대장 URL 사용, 공유, 공개/비공개 상태 관리는 대시보드로 이동한다.

저장 성공 후 에디터에서는 계속 수정하거나 대시보드로 나갈 수 있다. 대시보드는 저장된 초대장의 준비 상태, 공유하기, URL 복사, 공개/비공개 토글을 관리한다.

## 확정된 방향

- 에디터 저장 성공 모달의 버튼을 `다시 수정하기 / 초대장 URL 만들기`에서 `다시 수정하기 / 여기서 나가기`로 바꾼다.
- `여기서 나가기`를 누르면 `/dashboard`로 이동한다.
- 이동 방식은 `router.replace('/dashboard')`를 우선 사용한다.
- 방금 저장한 초대장 메타데이터는 `sessionStorage`로 대시보드에 넘긴다.
- 세션 payload 삭제 정책은 구현 단계에서 다시 결정한다.
- Google Drive 반영 지연 때문에 방금 저장한 초대장이 목록 조회에서 누락되면, 대시보드는 임시 pending 카드를 보여준다.
- 초대장 카드에 필요한 데이터가 하나라도 준비되지 않았으면 해당 카드는 로딩 상태를 유지한다.
- `published.json`은 제거한다.
- 기존 `published.json`과 `kakao-share.json`으로 나뉘어 있던 메타데이터를 `meta.json` 하나로 합친다.
- `meta.json`에는 공유 메타데이터와 공개 여부를 나타내는 boolean 값을 포함한다.
- `meta.json` 저장 실패는 전체 저장 실패로 본다.
- 새로 저장된 초대장은 기본적으로 비공개 상태다.
- 대시보드의 공개/비공개 토글이 공개로 전환될 때 초대장 폴더 퍼미션을 공개로 바꾼다.
- 공개/비공개 전환 API는 기존 publish API를 고쳐 쓰지 않고 새로 만든다.

## 현재 Drive 권한 모델

현재 실제 공개 권한을 부여하는 함수는 `publishPermissionWithRetry` 하나다.

```ts
{
  type: 'anyone',
  role: 'reader',
  allowFileDiscovery: false
}
```

즉 “링크를 가진 누구나 읽기 가능” 권한을 Google Drive `files/{id}/permissions`에 추가한다.

현재 권한 부여 지점:

- `/api/drive/publishInvitation`
  - 대상: `invitationFolderId`
  - 의미: 초대장 루트 폴더를 공개한다.
  - 호출 시점: 에디터 발행 버튼 또는 대시보드 발행 버튼 클릭 시.
- `/api/drive/shareUrl`
  - 대상: `kakao-share.json` 파일
  - 대상: `shareData.imageFileId` 대표 이미지 파일
  - 호출 시점: 저장 플로우에서 공유 메타데이터를 저장할 때.
- `/api/drive/thumbnail`
  - 썸네일 공개 권한 부여 코드는 현재 주석 처리되어 있다.

권한을 부여하지 않는 지점:

- workspace 폴더 생성
- invitation 폴더 생성
- `images` / `audios` 폴더 생성
- `data.json` 생성 또는 업데이트
- 썸네일 파일 생성

따라서 초대장을 막 생성하고 저장만 완료한 직후에는 공개 권한이 부여되지 않은 비공개 상태로 본다.

## 목표 공개/비공개 모델

- 초대장 생성 직후 `meta.published`는 `false`다.
- 대시보드 카드의 공개/비공개 토글은 `meta.published`를 기준으로 표시한다.
- `meta.published === false`인 카드는 토글이 비공개 상태를 가리킨다.
- 사용자가 토글을 공개로 전환하면 다음 작업을 수행한다.
  - 초대장 루트 폴더 `invitationFolderId`에 `anyone:reader` 권한을 부여한다.
  - guest data readiness를 확인한다.
  - 성공하면 `meta.published = true`로 저장한다.
  - 준비가 지연되면 해당 카드만 로딩/반영 중 상태를 유지한다.
- 사용자가 토글을 비공개로 전환하면 다음 작업을 수행한다.
  - 초대장 루트 폴더 `invitationFolderId`에서 `anyone` 공개 읽기 권한을 회수한다.
  - 성공하면 `meta.published = false`로 저장한다.
  - URL 자체는 유지하지만 외부 사용자는 초대장 내용을 볼 수 없다.
- 파일 단위 권한 부여는 원칙적으로 제거한다.
  - `meta.json`, 대표 이미지, 썸네일은 초대장 폴더 공개 권한 상속을 기대한다.
  - 단, Google Drive 실제 동작에서 상속 접근이 안정적으로 확인되어야 한다.

## 새 visibility API 계약

기존 `/api/drive/publishInvitation`을 고쳐 쓰기보다 새 API를 만든다. 이유는 기존 API 이름과 응답이 “발행” 중심이라, 공개/비공개 토글 모델과 의미가 맞지 않기 때문이다.

경로 제안:

```txt
PATCH /api/drive/invitationVisibility
```

요청 payload 제안:

```ts
type UpdateInvitationVisibilityRequest = {
  invitationFolderId: string;
  published: boolean;
};
```

응답 payload 제안:

```ts
type UpdateInvitationVisibilityResponse = {
  ok: boolean;
  invitationFolderId: string;
  dataJsonFileId: string;
  guestUrl: string;
  published: boolean;
  ready: boolean;
  warning?: 'guest_not_ready_after_visibility_update';
  error?: string;
  details?: unknown;
};
```

공개 전환 처리 순서:

1. `invitationFolderId` 유효성 확인
2. `data.json` 보장 및 `dataJsonFileId` 확보
3. `guestUrl = /guest/{dataJsonFileId}` 계산
4. `invitationFolderId`에 `anyone:reader` 권한 부여
5. guest data probe/readiness 확인
6. 준비 완료면 `meta.published = true` 저장
7. guest cache revalidate
8. 응답 반환

비공개 전환 처리 순서:

1. `invitationFolderId` 유효성 확인
2. `data.json` 보장 및 `dataJsonFileId` 확보
3. `guestUrl = /guest/{dataJsonFileId}` 계산
4. `invitationFolderId`의 `anyone` 권한 조회
5. 해당 permission id 삭제
6. `meta.published = false` 저장
7. guest cache revalidate
8. 응답 반환

누락되면 안 되는 기존 publish API의 핵심 기능:

- `publishPermissionWithRetry`의 재시도 정책
- `409 already_public` 성공 처리
- `guestPath(dataJsonFileId)` 계산
- `waitUntilGuestReady` 또는 `probeGuestData` 기반 readiness 확인
- `revalidateTag(invitation:{dataJsonFileId})`
- `revalidatePath(guestPath(dataJsonFileId))`
- readiness 지연 시 실패가 아니라 카드 단위 pending 상태로 유지할 수 있는 응답

새로 추가해야 하는 기능:

- `anyone` permission 조회
- permission id 삭제
- `meta.published` 업데이트
- 공개/비공개 모두 같은 API 계약으로 처리

## pending 카드 완료 조건

방금 저장한 초대장이 Drive 목록에 아직 반영되지 않을 수 있으므로, 대시보드는 `sessionStorage`의 pending payload를 기준으로 임시 카드를 만들 수 있다.

pending 카드가 완료 상태가 되려면 다음 조건을 모두 만족해야 한다.

- Drive 목록에 해당 `invitationFolderId`가 보인다.
- `meta.json`이 읽힌다.
- `thumbnailFileId` 기반 썸네일 또는 fallback 이미지가 결정된다.
- `dataJsonFileId`가 확보된다.
- `guestUrl`이 확보된다.
- guest data probe가 성공한다.

probe는 무겁게 전체 카드에 반복 적용하지 않는다.

- 방금 저장한 pending 카드에 우선 적용한다.
- 공개 토글 전환 직후 해당 카드에 적용한다.
- 기존 카드 전체에 dashboard mount마다 무조건 probe를 돌리지는 않는다.
- probe 실패 시 카드는 “준비 중” 상태를 유지하고, 카드 단위 재시도만 수행한다.

이유:

- Google Drive 전파 지연 때문에 어느 타이밍엔가는 probe가 필요하다.
- 하지만 모든 카드에 매번 probe를 돌리면 대시보드 초기 로드가 무거워진다.
- 지연 가능성이 높은 대상은 “방금 저장한 카드”와 “방금 공개 전환한 카드”다.

## 비공개 초대장 guest 안내 UI

현재 guest 페이지는 `dataJsonFileId`로 공개 Drive URL을 fetch하고, 실패하면 `notFound()`로 처리한다.

비공개 초대장은 URL 자체는 존재하지만 외부 사용자는 접근할 수 없다. 이때 404만 보여주는 것보다 안내 UI를 보여주는 방향이 더 좋다.

정책:

- `/guest/{dataJsonFileId}`에서 공개 Drive fetch가 실패하면 전부 404로 보내지 않는다.
- 대신 “이 초대장은 아직 공개되지 않았거나 준비 중입니다” 계열의 안내 UI를 보여준다.
- 안내 문구는 “초대장 소유자는 마이페이지에서 공개 설정을 확인해 주세요”처럼 공개 처리 유도 문구를 포함한다.
- 실제로 삭제된 초대장, 비공개 초대장, Drive 전파 지연은 public guest 페이지에서 정확히 구분하기 어렵다.
- 따라서 안내 UI는 “비공개 또는 준비 중 또는 찾을 수 없음”을 포괄하는 안전한 문구로 설계한다.

주의:

- 현재 구조는 별도 DB가 없고, guest 페이지는 비공개 Drive 파일의 `meta.json`도 읽을 수 없다.
- 따라서 guest 페이지에서 “정확히 비공개다”라고 단정하려면 공개적으로 읽을 수 있는 별도 상태 저장소가 필요하다.
- 현 구조에서는 단정 대신 포괄 안내 UI가 현실적이다.

## 작업 가정

- 에디터 저장 결과는 대시보드 handoff에 필요한 최소 메타데이터를 제공해야 한다.
- 필요한 최소값은 `invitationFolderId`, `invitationUuid`, `dataJsonFileId`, `guestUrl`, 가능하면 `thumbnailFileId`다.
- 대시보드 pending 카드의 로딩 UI는 우선 임시 형태로 구현한다.
- 최종 대시보드 UI와 정확한 버튼 배치는 이후 Figma 기준으로 정리한다.
- 공개/비공개 토글은 각 초대장 카드에 붙는다.
- 기존 대시보드의 모든 미공개 카드가 자동 공개되는 흐름은 만들지 않는다.
- 각 카드는 대시보드 카드의 토글과 상태를 통해 제어한다.

## 목표 데이터 계약

### 저장 후 대시보드 handoff 세션 payload

키 이름 제안:

```ts
const DASHBOARD_PENDING_INVITATION_KEY = 'invia.dashboard.pendingInvitation';
```

payload 제안:

```ts
type DashboardPendingInvitation = {
  invitationFolderId: string;
  invitationUuid: string;
  dataJsonFileId: string;
  guestUrl: string;
  thumbnailFileId?: string;
  createdAt: string;
};
```

### meta.json

파일명: `meta.json`

kind 값 제안:

```ts
const META_JSON_KIND = 'invitation_meta_json';
```

payload 제안:

```ts
type InvitationMeta = {
  guestUrl: string;
  dataJsonFileId: string;
  published: boolean;
  share: {
    title: string;
    description: string;
    imageFileId?: string;
    showLocationButton: boolean;
    locationInfo?: {
      lat: number;
      lng: number;
      placeName: string;
    };
  };
  updatedAt: string;
};
```

메모:

- `guestUrl`은 기존 `published.json.guestUrl`을 대체한다.
- `published`는 기존처럼 `published.json` 파일 존재 여부로 판단하던 발행 상태를 대체한다.
- 기존 `kakao-share.json` 데이터는 `meta.share`로 이동한다.
- 위치 공유가 꺼져 있거나 위치 정보가 유효하지 않으면 `locationInfo`는 저장하지 않는다.
- 저장 직후 기본값은 `published: false`다.

## 남아 있는 발행 로직과 이관 대상

현재 코드에서 “발행”이라는 이름 또는 역할로 남아 있는 로직은 다음과 같다.

### 1. 에디터 발행 UI 및 hook

- `widgets/editor/preview/components/SaveModal.tsx`
  - 저장 성공 후 `초대장 URL 만들기` 버튼을 노출한다.
  - 발행 중/완료/실패 UI를 가지고 있다.
  - 최종 URL 복사 버튼도 가지고 있다.
- `widgets/editor/preview/hooks/useInvitationPublish.ts`
  - `/api/drive/publishInvitation` 호출
  - `/api/drive/publishInvitation/readiness` polling
  - 발행 결과, 에러, busy 상태 관리

처리 방향:

- 에디터에서는 제거한다.
- 저장 성공 모달은 `다시 수정하기 / 여기서 나가기`만 담당한다.
- 발행 상태, URL 복사, readiness polling은 대시보드로 이관한다.

### 2. 대시보드 발행 hook 상태

- `app/dashboard/hooks/useDashboardInvitations.ts`
  - `publishBusy`
  - `publishErrors`
  - `publishResults`
  - `readinessPolling`
  - `handlePublish`
  - `pollGuestReadiness`
  - `getPublishedUrl`
  - `handleCopyPublishedUrl`

처리 방향:

- `handlePublish`는 공개 토글의 `공개로 전환` 액션으로 재정의한다.
- 상태명은 `publish`보다 `visibility` 또는 `publicAccess` 기준으로 바꾸는 것이 좋다.
- readiness polling은 유지하되 카드 단위 공개 전환 흐름에 붙인다.
- URL 복사는 `meta.guestUrl` 기준으로 바꾼다.

### 3. 대시보드 발행 UI

- `app/dashboard/components/carousel/item/actions/PublishButton.tsx`
  - `URL 발행하기`, `재발행하기`, `발행 중` 라벨을 가진다.
- `app/dashboard/components/carousel/item/actions/PublishedUrlActions.tsx`
  - 발행 URL 노출 및 복사 버튼을 가진다.
- `app/dashboard/components/carousel/item/ItemHeader.tsx`
  - `URL 발행됨 / URL 발행 안됨` 상태 표시를 가진다.
- `CarouselItem`, `CarouselTrack`, `CarouselBase`, `CarouselWrapper`
  - `onPublish`, `isPublishing`, `isPublishReadinessPolling`, `isPublishReadyPending`, `publishedUrl` props를 전달한다.

처리 방향:

- `PublishButton`은 공개/비공개 토글 또는 토글 연결용 임시 UI로 교체한다.
- URL 복사와 공유하기 버튼은 대시보드 카드 액션으로 유지한다.
- 라벨은 “발행”보다 “공개/비공개”, “URL 준비 중”, “URL 복사” 기준으로 정리한다.

### 4. 발행 API

- `app/api/drive/publishInvitation/route.ts`
  - `invitationFolderId`를 공개 권한으로 전환한다.
  - `published.json`을 생성/업데이트한다.
  - guest readiness를 확인한다.
- `app/api/drive/publishInvitation/readiness/route.ts`
  - `dataJsonFileId` 기준으로 guest data readiness를 확인한다.

처리 방향:

- 기존 `/api/drive/publishInvitation`은 새 visibility API로 대체한다.
- 공개 전환 API는 `published.json`을 쓰지 않고 `meta.published`를 업데이트해야 한다.
- readiness route의 핵심 probe는 재사용 가능하다.
- 기존 API는 마이그레이션 후 제거 후보로 둔다.

### 5. published.json 유틸 및 목록 조회

- `app/api/drive/_lib/ensurePublishedJsonFile.ts`
  - `published.json` 생성/업데이트 담당
- `app/dashboard/server/loadDashboardInvitations.ts`
  - `published.json`을 찾아 `publishedUrl`을 채운다.
- `app/api/drive/loadInvitation/route.test.ts`
  - `published.json` 기준 테스트가 있다.

처리 방향:

- `ensurePublishedJsonFile`은 제거 대상이다.
- 대시보드 목록 조회는 `meta.json`을 읽어 `guestUrl`과 `published`를 채워야 한다.
- 테스트도 `meta.json` 기준으로 바꾼다.

### 6. 공유 메타 저장 중 권한 부여

- `app/api/drive/shareUrl/route.ts`
  - `kakao-share.json` 생성/업데이트
  - `kakao-share.json` 파일 공개
  - 대표 이미지 파일 공개
- `features/invitation/save/saveInvitationFlow.ts`
  - 저장 commit 단계에서 `/api/drive/shareUrl`을 호출한다.
  - 현재 이 실패는 전체 저장 실패로 보지 않는다.

처리 방향:

- `kakao-share.json`은 `meta.json`으로 대체한다.
- `meta.json` 저장 실패는 저장 실패로 본다.
- 파일별 공개 권한 부여는 제거한다.
- 공유 데이터는 `meta.share`로 저장한다.

### 7. 정책/FAQ 문구

- `app/policy/page.tsx`
- `app/faq/data.ts`

처리 방향:

- 기능 변경 후 문구도 맞춰야 한다.
- “발행” 표현을 “공개”, “공유”, “URL 복사” 중심으로 재정리한다.

## 구현 단계

1. 에디터 저장 전용 UX
   - `SaveModal`에서 발행 단계를 제거한다.
   - 저장 성공 시 `여기서 나가기` 액션을 추가한다.
   - 이동은 `router.replace('/dashboard')`를 사용한다.
   - 이동 전에 pending invitation payload를 `sessionStorage`에 저장한다.

2. 저장 응답 계약 정리
   - `saveInvitationFlow`가 `dataJsonFileId`와 가능하면 `thumbnailFileId`를 반환하게 한다.
   - `meta.json` 저장 실패를 전체 저장 실패로 처리한다.
   - 저장 commit 단계에서 `kakao-share.json` 대신 `meta.json`을 저장하게 한다.
   - 저장 직후 `meta.published`는 `false`로 저장한다.

3. 대시보드 pending invitation intake
   - 대시보드 mount 시 `sessionStorage`의 pending invitation payload를 읽는다.
   - Drive 목록에 해당 folder가 없으면 임시 로딩 카드를 목록에 합친다.
   - 세션 payload를 언제 지울지는 구현 중 별도 정책으로 정한다.
   - pending 완료 조건을 모두 만족할 때까지 해당 카드는 로딩 상태를 유지한다.

4. 새 visibility API 추가
   - 기존 publish API에서 누락되면 안 되는 권한 부여, readiness, cache revalidate 로직을 옮긴다.
   - 공개 전환과 비공개 전환을 하나의 API 계약으로 처리한다.
   - 비공개 전환을 위해 `anyone` permission 조회/삭제 로직을 추가한다.
   - 상태 저장은 `meta.published`로 한다.

5. 대시보드 공개/비공개 토글
   - 토글 초기값은 `meta.published`를 따른다.
   - `false`면 비공개로 표시한다.
   - 공개 전환 시 새 visibility API를 호출한다.
   - 비공개 전환 시 새 visibility API를 호출한다.
   - readiness가 지연되면 해당 카드만 로딩 상태로 둔다.

6. 대시보드 공유 및 URL 복사 연결
   - 공유 데이터는 `meta.json`에서 읽는다.
   - URL 복사는 `meta.guestUrl`을 기준으로 한다.
   - 카드가 준비되지 않았거나 비공개면 URL 복사/공유 버튼은 비활성 또는 로딩 상태로 둔다.

7. guest 비공개 안내 UI
   - Drive 공개 fetch 실패 시 무조건 `notFound()`로 보내지 않는다.
   - 비공개/준비 중/찾을 수 없음 안내 UI를 만든다.
   - 소유자에게 마이페이지에서 공개 설정을 확인하라는 문구를 제공한다.

8. 발행/meta 마이그레이션
   - `published.json` 조회를 `meta.json` 조회로 교체한다.
   - 에디터의 `useInvitationPublish` 의존성을 제거한다.
   - 기존 publish API는 제거 후보로 둔다.
   - 부모 폴더 권한 상속이 실제 Drive 동작에서 충분히 확인되면, 메타데이터/이미지 파일에 대한 직접 권한 변경을 제거한다.

9. 테스트
   - 저장 API 테스트를 `meta.json` 기준으로 수정한다.
   - 초대장 목록 조회 테스트를 `meta.json`에서 URL과 published 값을 읽는 기준으로 수정한다.
   - 대시보드 hook 테스트에 pending session payload와 Drive 목록 반영 지연 케이스를 추가한다.
   - 공개/비공개 전환 토글 테스트를 추가한다.
   - visibility API 테스트를 추가한다.
   - guest 비공개 안내 UI 테스트를 추가한다.
   - 저장 성공 모달의 버튼 변경은 컴포넌트 테스트나 집중 assertion으로 확인한다.

## 위험 지점

- Google Drive 목록/인덱싱 지연은 폴더 조회, 썸네일 조회, meta 조회에 각각 따로 영향을 줄 수 있다.
- 부모 폴더 권한 상속은 실제 Drive 정책과 파일 소유권 조건에서 검증이 필요하다.
- 현재 코드에는 공개 권한 부여만 있고 권한 회수 로직이 없다.
- 권한 회수는 `permissionId` 조회가 필요할 수 있으므로 별도 설계가 필요하다.
- public guest 페이지는 비공개 Drive 파일의 meta를 읽을 수 없으므로, 비공개/삭제/전파 지연을 정확히 구분하기 어렵다.
- 현재 발행/readiness 로직이 에디터와 대시보드에 중복되어 있다. 리팩토링 중 세 번째 중복 구현이 생기지 않도록 한다.
- 일부 소스 파일의 한글 문자열이 터미널 출력에서 깨져 보인다. 이번 리팩토링 범위 밖의 문구는 넓게 수정하지 않는다.

## 보류된 결정

- `sessionStorage` payload를 정확히 언제 삭제할지.
- Figma 기준 최종 대시보드 카드 UI.
- 공개/비공개 토글의 정확한 시각 디자인과 문구.
- 새 visibility API의 최종 경로명.
- 비공개 guest 안내 UI의 최종 문구와 디자인.
