# 대시보드 초대장 미리보기 기능 계획서

## 목표

대시보드에서 만들어진 초대장을 휴대폰 UI 프레임 안에서 미리볼 수 있게 한다.

미리보기는 iframe을 쓰지 않고, 실제 게스트 초대장 렌더러인 `GuestRenderer` 계열을 재사용한다. 화면 폭과 프레임 크기는 실제 게스트 페이지와 다를 수 있지만, 초대장 기능 자체는 실제 게스트 페이지와 동일하게 동작해야 한다.

필수 동작:

- 대표 이미지가 정상 표시된다.
- 본문 블록 이미지가 정상 표시된다.
- 사용자 BGM과 기본 BGM이 실제 게스트 페이지와 동일하게 동작한다.
- 초대장 내부 스크롤이 가능하다.
- 공개 초대장과 비공개 초대장 모두 대시보드 소유자는 미리볼 수 있다.
- 미리보기는 딤드 오버레이 위 중앙 휴대폰 프레임으로 표시한다.

## 현재 구조 요약

실제 게스트 페이지는 `app/guest/[id]/page.tsx`에서 구성된다.

- `loadGuestPayload(id)`가 공개 Drive URL로 `data.json`을 읽는다.
- `GuestMainPoster`가 `mainPoster.thumbnailFileId`를 받아 대표 이미지를 렌더링한다.
- `GuestBgm`이 `payload.bgm`을 받아 BGM 토글과 재생을 처리한다.
- `GuestRenderer`가 `payload.blocks`, `payload.bulkData`, `payload.renderHints`를 받아 블록들을 렌더링한다.

대시보드 편집 복원 API는 이미 비공개 Drive 파일을 읽는 흐름을 가지고 있다.

- `app/api/drive/updateInvitation/route.ts`
- `app/api/drive/_lib/getSaveDataFetch.ts`

이 흐름은 브라우저가 비공개 파일을 직접 읽는 방식이 아니라, 서버가 로그인된 사용자의 Google OAuth 권한으로 Drive API를 호출해서 `data.json`과 폴더 파일 목록을 읽는다.

## 구현 방향

### 1. 게스트 화면 shell 분리

현재 `app/guest/[id]/page.tsx`에 직접 들어 있는 게스트 화면 조립부를 재사용 가능한 컴포넌트로 분리한다.

새 컴포넌트 예시:

- `app/guest/[id]/components/GuestInvitationView.tsx`

역할:

- `GuestBgm` 렌더링
- `GuestMainPoster` 렌더링
- `GuestRenderer` 렌더링
- `payload.bulkData.backgroundColor` 적용
- 실제 게스트 페이지와 대시보드 미리보기에서 동일한 구성 사용

예상 props:

```ts
type GuestInvitationViewProps = {
  payload: NormalizedGuestPayload;
  mode?: 'guest' | 'dashboard-preview';
};
```

실제 게스트 페이지는 기존처럼 공개 `data.json`을 읽은 뒤 이 컴포넌트만 호출한다.

```tsx
<GuestInvitationView payload={payload} mode="guest" />
```

대시보드 미리보기는 인증된 preview API로 받은 payload를 휴대폰 프레임 내부에서 호출한다.

```tsx
<GuestInvitationView payload={payload} mode="dashboard-preview" />
```

### 2. 대시보드 preview payload API 추가

비공개 초대장은 공개 Drive URL로 `data.json`을 읽을 수 없다. 따라서 대시보드 미리보기는 별도 인증 API가 필요하다.

추가 API:

- `app/api/drive/previewInvitation/route.ts`

요청:

```http
GET /api/drive/previewInvitation?folderId={invitationFolderId}
```

처리 순서:

1. 로그인 세션과 Google Drive access token을 확인한다.
2. `folderId`가 현재 사용자의 Invia workspace 아래 초대장 폴더인지 확인한다.
3. 해당 폴더 내부에서 `data.json`을 찾는다.
4. Drive API `files/{dataJsonFileId}?alt=media`로 `data.json`을 다운로드한다.
5. `parseGuestPayload`로 실제 게스트 페이지와 동일한 정규화/검증을 수행한다.
6. 정규화된 payload와 필요한 파일 ID 메타데이터를 반환한다.

현재 운영 로직에 붙는 지점:

- `app/api/drive/_lib/getSaveDataFetch.ts`의 `loadInvitations`, `downloadFiles`, `getFilesInFolder` 패턴을 재사용하거나 preview 전용 lib로 분리한다.
- `app/guest/[id]/validation/parseGuestPayload.ts`는 그대로 재사용한다.
- `app/dashboard/hooks/useDashboardInvitations.ts` 또는 별도 `useDashboardInvitationPreview.ts`에서 이 API를 호출한다.

분기 기준:

- 실제 게스트 페이지: 공개 `data.json` URL을 읽는다.
- 대시보드 미리보기: `folderId` 기반 인증 API로 `data.json`을 읽는다.

이 분기 덕분에 초대장을 공개 상태로 바꾸지 않고도 대시보드 소유자만 비공개 초대장을 볼 수 있다.

### 3. 미리보기 에셋 프록시 추가

`data.json`만 서버에서 읽어도 비공개 이미지와 사용자 BGM은 브라우저에서 깨질 수 있다. 이미지와 오디오는 브라우저가 직접 Drive public URL을 요청하기 때문이다.

따라서 대시보드 미리보기 모드에서는 Drive file id를 내부 인증 프록시 URL로 변환해야 한다.

추가 API:

- `app/api/drive/previewAsset/route.ts`

요청:

```http
GET /api/drive/previewAsset?folderId={invitationFolderId}&fileId={driveFileId}&kind=image
GET /api/drive/previewAsset?folderId={invitationFolderId}&fileId={driveFileId}&kind=audio
```

처리 순서:

1. 로그인 세션을 확인한다.
2. `fileId`가 현재 사용자의 Drive 파일이며 Invia 초대장 폴더 하위 파일인지 검증한다.
3. Drive API `files/{fileId}?alt=media`로 파일 stream을 가져온다.
4. `Content-Type`, `Content-Length`, `Range`, `Content-Range`, `Accept-Ranges` 등을 가능한 보존해 응답한다.

현재 운영 로직에 붙는 지점:

- 이미지: `shared/utils/media/driveImageUtils.ts`에 preview mode 분기를 추가한다.
- 단일 이미지 hook: `shared/hooks/useResolvedImageSource.ts`
- 다중 이미지 hook: `shared/hooks/useResolvedImageSources.ts`
- 사용자 BGM: `app/guest/[id]/components/GuestBgm.tsx`

예상 변경:

```ts
type DriveImageResolveMode = 'public' | 'dashboard-preview';

function resolveDriveImageSource(source: string, options?: {
  mode?: DriveImageResolveMode;
}) {
  if (options?.mode === 'dashboard-preview' && isDriveFileId(source)) {
    return `/api/drive/previewAsset?kind=image&folderId=${encodeURIComponent(options.folderId)}&fileId=${encodeURIComponent(source)}`;
  }

  return publicDriveFileUrl(source);
}
```

`GuestBgm`은 현재 사용자 BGM 직접 URL이 실패하면 `/api/drive/guestBgm`으로 우회한다. 대시보드 미리보기에서는 실패를 기다리지 않고 처음부터 preview asset 프록시를 사용한다.

```ts
mode === 'dashboard-preview'
  ? `/api/drive/previewAsset?kind=audio&folderId=${folderId}&fileId=${fileId}`
  : driveAudioUrl(fileId)
```

분기 기준:

- 실제 게스트 페이지 공개 초대장: 기존 public Drive URL 우선 사용
- 대시보드 미리보기: 인증된 `/api/drive/previewAsset` URL 사용

이 방식이면 비공개 상태에서도 이미지와 사용자 BGM이 정상 동작한다.

### 4. 대시보드 UI 추가

추가 컴포넌트:

- `app/dashboard/components/preview/DashboardInvitationPreviewModal.tsx`
- `app/dashboard/components/preview/PhonePreviewFrame.tsx`
- `app/dashboard/hooks/useDashboardInvitationPreview.ts`

`useDashboardInvitationPreview` 역할:

- 열림/닫힘 상태 관리
- 선택된 `folderId` 관리
- preview payload fetch
- loading/error/success 상태 관리
- AbortController로 닫힌 모달의 pending 요청 정리

대시보드 carousel에 붙는 지점:

- `app/dashboard/components/carousel/item/CarouselItem.tsx`
- `app/dashboard/components/carousel/CarouselWrapper.tsx`
- `app/dashboard/components/carousel/CarouselBase.tsx`
- `app/dashboard/components/carousel/CarouselTrack.tsx`

버튼 위치는 카드 우측 사이드 액션 영역에 추가한다. 현재 삭제 버튼이 선택된 카드 우측 바깥에 세로로 떠 있으므로, 미리보기 버튼은 삭제 버튼 위 같은 세로 선상에 배치한다.

아이콘:

- `shared/assets/icons/preview.svg`
- 삭제 버튼과 같은 사이드 액션 버튼 크기를 사용한다.
- 아이콘은 버튼 중앙에 정렬한다.
- 텍스트 라벨은 노출하지 않고 `aria-label="초대장 미리보기"`를 제공한다.

기존 중앙 액션 흐름은 다음처럼 유지한다.

- 카카오톡 공유하기
- URL 링크 공유하기
- 재편집하기

버튼 클릭 흐름:

```ts
onPreview(invite.folderId)
```

`CarouselWrapper`에서 `useDashboardInvitationPreview`를 가지고 modal을 렌더링한다.

```tsx
<>
  <CarouselBase ... onPreview={openPreview} />
  <DashboardInvitationPreviewModal
    isOpen={preview.isOpen}
    status={preview.status}
    payload={preview.payload}
    onClose={preview.close}
  />
</>
```

### 5. 휴대폰 UI 에셋 위치

휴대폰 프레임 에셋은 이미 다음 위치에 추가되어 있다.

- `shared/assets/images/dashboard/invitation-preview-frame.png`

해당 에셋은 원본 크기를 그대로 사용한다. 프레임 자체를 CSS로 강제 리사이즈하지 않고, 내부 screen 영역만 프레임 이미지 좌표에 맞춰 잡는다.

추가로 여러 상태나 해상도별 에셋이 생기면 폴더를 분리한다.

- `shared/assets/images/dashboard/phone-frame/frame.png`
- `shared/assets/images/dashboard/phone-frame/shadow.png`
- `shared/assets/images/dashboard/phone-frame/mask.png`

이 위치를 권장하는 이유:

- 이미 대시보드 전용 이미지가 `shared/assets/images/dashboard/empty-card.png`에 있다.
- 대시보드 컴포넌트에서 alias import로 재사용하기 쉽다.
- public URL 직접 참조보다 Next image import와 타입 추적이 쉽다.

`PhonePreviewFrame`은 에셋을 배경 또는 overlay 이미지로 사용하고, 내부 screen 영역에 `GuestInvitationView`를 넣는다.

```tsx
<div className="phone-shell">
  <Image src={PhoneFrameImage} alt="" fill priority />
  <div className="phone-screen">
    <GuestInvitationView payload={payload} mode="dashboard-preview" />
  </div>
</div>
```

screen 영역은 휴대폰 에셋의 실제 디스플레이 좌표에 맞춰 `position:absolute`로 잡는다. 내부는 `overflow-y:auto`로 둔다.

### 6. 딤드 오버레이와 닫기 UX

미리보기는 통신이 포함되므로 닫기 UX를 명확히 정해야 한다.

권장 UX:

- 미리보기 버튼 클릭 즉시 모달을 연다.
- 휴대폰 프레임 내부에는 loading skeleton을 표시한다.
- 배경 딤드 클릭, Esc, 닫기 버튼으로 닫을 수 있다.
- 닫을 때 진행 중인 preview payload 요청은 AbortController로 취소한다.
- 닫힌 뒤 늦게 도착한 응답은 request id로 무시한다.
- BGM은 모달 unmount 시 `GuestBgm` cleanup으로 자동 pause되게 한다.

이 방식이면 외부 클릭으로 닫혀도 문제가 없다. 네트워크 요청은 취소되고, 취소가 늦어져도 닫힌 모달의 state를 갱신하지 않는다.

`abort()`는 브라우저 `fetch`에 `AbortSignal`을 넘긴 경우 정상적으로 사용할 수 있다.

```ts
fetch('/api/drive/previewInvitation?...', { signal: controller.signal })
```

사용자가 모달을 닫으면 클라이언트 입장에서는 더 이상 응답이 필요 없으므로 요청을 abort한다. 이때 이미 서버 내부에서 Google Drive 요청이 시작된 경우 서버 작업이 즉시 중단된다고 보장할 수는 없다. 따라서 abort는 다음 목적을 가진다.

- 닫힌 모달에 대한 클라이언트 fetch 대기를 중단한다.
- 늦게 도착한 응답이 React state를 갱신하지 않게 한다.
- 사용자가 여러 초대장을 빠르게 눌렀을 때 오래된 응답을 무시한다.

서버 작업이 이미 진행 중인 경우를 대비해 request id 검증도 반드시 같이 둔다. 즉, abort만 믿지 않고 `abort + request id 무시`를 함께 사용한다.

구현 규칙:

```ts
const requestIdRef = useRef(0);

async function openPreview(folderId: string) {
  const requestId = requestIdRef.current + 1;
  requestIdRef.current = requestId;
  controllerRef.current?.abort();

  const controller = new AbortController();
  controllerRef.current = controller;

  setState({ isOpen: true, status: 'loading', folderId });

  try {
    const payload = await fetchPreview(folderId, controller.signal);
    if (requestIdRef.current !== requestId) return;
    setState({ isOpen: true, status: 'success', folderId, payload });
  } catch (err) {
    if (controller.signal.aborted) return;
    if (requestIdRef.current !== requestId) return;
    setState({ isOpen: true, status: 'error', folderId, error });
  }
}

function closePreview() {
  requestIdRef.current += 1;
  controllerRef.current?.abort();
  setState({ isOpen: false, status: 'idle' });
}
```

외부 클릭 닫기를 막을 필요는 없다. 다만 사용자가 실수로 닫는 문제를 줄이기 위해 다음을 적용한다.

- 휴대폰 프레임 내부 클릭은 propagation을 막는다.
- BGM이 켜져 있어도 외부 클릭 닫기는 허용한다.
- 닫기 버튼은 명확히 표시한다.
- loading 중에도 닫기 가능하게 한다.

### 7. 보안과 권한 검증

대시보드 preview API와 asset proxy API는 public API처럼 보이지만, 실제로는 반드시 로그인된 사용자 전용이어야 한다.

필수 검증:

- 인증 세션이 없으면 401
- Drive access token 갱신 실패 시 401
- `folderId`가 현재 사용자의 workspace 하위 초대장 폴더가 아니면 404 또는 403
- `fileId`가 해당 초대장 폴더 하위 파일이 아니면 403
- 응답 캐시는 `private`로 제한

API 응답 메시지:

| 상황 | 상태 코드 | API message | 사용자 안내 |
| --- | ---: | --- | --- |
| 로그인 세션 없음 | 401 | `LOGIN_REQUIRED` | `로그인이 필요합니다. 다시 로그인해 주세요.` |
| Drive access token 갱신 실패 | 401 | `RELOGIN_REQUIRED` | `Google Drive 연결이 만료되었습니다. 다시 로그인해 주세요.` |
| Drive 권한 scope 없음 | 403 | `DRIVE_SCOPE_REQUIRED` | `초대장 미리보기를 위해 Google Drive 권한이 필요합니다.` |
| `folderId` 누락 | 400 | `FOLDER_ID_REQUIRED` | `미리볼 초대장 정보를 찾지 못했습니다.` |
| `fileId` 누락 | 400 | `FILE_ID_REQUIRED` | `미리보기 파일 정보를 찾지 못했습니다.` |
| folderId가 현재 사용자 workspace 하위가 아님 | 404 | `INVITATION_NOT_FOUND` | `초대장을 찾을 수 없습니다.` |
| fileId가 해당 초대장 폴더 하위가 아님 | 403 | `ASSET_FORBIDDEN` | `이 미리보기 파일에 접근할 수 없습니다.` |
| data.json 다운로드 실패 | 502 | `PREVIEW_DATA_DOWNLOAD_FAILED` | `초대장 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.` |
| data.json 파싱/검증 실패 | 422 | `INVALID_PREVIEW_DATA` | `초대장 데이터 형식이 올바르지 않습니다.` |
| 이미지/BGM 파일 다운로드 실패 | 502 | `PREVIEW_ASSET_DOWNLOAD_FAILED` | `미리보기 파일을 불러오지 못했습니다.` |
| 예상하지 못한 오류 | 500 | `PREVIEW_UNKNOWN_ERROR` | `미리보기를 불러오는 중 오류가 발생했습니다.` |

클라이언트 표시 기준:

- 401 계열은 로그인 재시도 액션을 안내한다.
- 403 권한 계열은 Drive 권한 재연동 액션을 안내한다.
- 404는 해당 초대장이 삭제되었거나 접근할 수 없다는 문구를 보여준다.
- 5xx는 재시도 버튼을 제공한다.

권장 캐시:

- `previewInvitation`: `Cache-Control: no-store`
- `previewAsset`: `Cache-Control: private, max-age=300` 또는 파일 변경 가능성을 고려해 짧은 private cache

### 8. 테스트 계획

단위 테스트:

- `previewInvitation` API가 비공개 `data.json`을 OAuth 경로로 읽고 `parseGuestPayload`를 호출하는지
- workspace 바깥 folderId 요청을 거부하는지
- `previewAsset` API가 image/audio content type과 range header를 보존하는지
- `resolveDriveImageSource`가 guest mode와 dashboard-preview mode에서 다른 URL을 반환하는지
- `GuestBgm`이 dashboard-preview mode에서 사용자 BGM 프록시 URL을 바로 쓰는지

컴포넌트 테스트:

- 미리보기 버튼 클릭 시 modal이 열린다.
- loading 상태가 휴대폰 프레임 내부에 표시된다.
- payload 로드 성공 시 `GuestInvitationView`가 렌더링된다.
- 외부 딤드 클릭 시 modal이 닫히고 pending fetch가 abort된다.
- 닫힌 뒤 늦은 응답이 state를 다시 열지 않는다.

수동 확인:

- 공개 초대장 미리보기
- 비공개 초대장 미리보기
- 대표 이미지 표시
- 갤러리/사진 블록 이미지 표시
- 기본 BGM 재생
- 사용자 업로드 BGM 재생
- 내부 스크롤
- 딤드 클릭 닫기
- Esc 닫기
- 재오픈 시 이전 BGM이 남아 재생되지 않는지

## 단계별 구현 순서

1. `GuestInvitationView`를 분리하고 실제 게스트 페이지가 기존과 동일하게 동작하는지 확인한다.
2. `previewInvitation` API를 추가해 비공개 `data.json`을 대시보드 소유자 권한으로 읽는다.
3. `previewAsset` API를 추가해 비공개 이미지/BGM을 인증 프록시로 제공한다.
4. 이미지 URL resolver와 `GuestBgm`에 `dashboard-preview` mode 분기를 추가한다.
5. 휴대폰 프레임 에셋을 `shared/assets/images/dashboard/phone-frame.*`에 추가하고 `PhonePreviewFrame`을 만든다.
6. 대시보드 carousel 액션에 `미리보기` 버튼과 modal 상태를 연결한다.
7. 딤드 닫기, request abort, 늦은 응답 무시 처리를 추가한다.
8. 테스트와 수동 QA를 진행한다.

## 결정 사항

- iframe은 사용하지 않는다.
- 렌더링은 `GuestRenderer`와 게스트 화면 구성 컴포넌트를 재사용한다.
- 비공개 초대장은 공개 상태로 바꾸지 않는다.
- 비공개 데이터와 에셋은 서버 OAuth + 인증 프록시로 읽는다.
- 미리보기는 실제 초대장 기능과 동일하게 동작한다.
