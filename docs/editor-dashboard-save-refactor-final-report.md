# 에디터 저장 플로우 및 대시보드 공개 관리 리팩토링 결과 보고서

> 작성일: 2026-06-11  
> 기준: 현재 작업 트리의 `git diff HEAD` 및 untracked `app/api/drive/guestReadiness/` 확인 기준  
> 목적: 에디터의 발행 역할 제거, 대시보드 중심의 공개/비공개/공유/URL 관리 구조로 전환된 내용을 코드 기준으로 설명한다.

---

## 1. 결론

이번 리팩토링의 핵심 변화는 **에디터는 저장만 담당하고, 공개/비공개/공유/URL/readiness 관리는 대시보드가 담당하도록 책임을 분리한 것**이다.

과거에는 저장 성공 후 에디터 또는 대시보드의 "발행" 버튼이 공개 권한 부여, URL 생성, readiness 확인을 한 번에 수행했다. 현재는 저장 과정에서 기본 공개 권한을 먼저 붙이고, 대시보드는 `meta.json`과 pending handoff를 기반으로 방금 만든 초대장을 안정적으로 흡수한다. 이후 사용자가 공개/비공개 토글을 조작하면 `invitationVisibility` API가 Drive 권한과 `meta.published`를 갱신한다.

```mermaid
flowchart LR
  A["에디터"] -->|"저장만 수행"| B["Drive 저장"]
  B -->|"초기 공개 요청"| C["invitationVisibility API"]
  B -->|"sessionStorage handoff"| D["대시보드"]
  D -->|"pending 카드 보정"| E["Drive 목록 + meta.json + readiness"]
  D -->|"공개/비공개 토글"| C
  D -->|"공유/URL 복사"| F["meta.json kakaoShare + guestUrl"]
  G["게스트 페이지"] -->|"공개 data.json 읽기"| B
  G -->|"비공개/HTML 응답"| H["비공개 안내 UI"]
```

---

## 2. Diff 기준 변경 규모

현재 `git diff HEAD --stat` 기준으로는 다음 규모의 변경이 있다.

```txt
31 files changed, 2418 insertions(+), 591 deletions(-)
```

추가로 `git diff HEAD`에는 잡히지 않는 untracked 경로가 있다.

```txt
app/api/drive/guestReadiness/
docs/editor-dashboard-save-refactor-progress-report.md
```

이번 보고서 파일도 새로 추가된다.

---

## 3. Before / After

### 3.1 책임 분리

```mermaid
flowchart TB
  subgraph BEFORE["이전 구조"]
    E1["에디터 저장 모달"] --> S1["저장"]
    E1 --> P1["초대장 URL 만들기"]
    P1 --> PP1["publishInvitation"]
    PP1 --> GP1["Drive 공개 권한 부여"]
    PP1 --> RD1["readiness polling"]

    D1["대시보드 카드"] --> P2["발행 버튼"]
    P2 --> PP1
    D1 --> SH1["공유 / URL 복사"]
  end

  subgraph AFTER["현재 구조"]
    E2["에디터 저장 모달"] --> S2["저장"]
    S2 --> IV0["초기 공개 요청"]
    S2 --> SS2["sessionStorage handoff"]
    SS2 --> D2["대시보드"]
    D2 --> PD2["pending 카드 보정"]
    D2 --> IV2["공개/비공개 토글"]
    D2 --> SH2["공유 / URL 복사"]
    IV2 --> RD2["readiness probe"]
  end

  BEFORE -. "리팩토링" .-> AFTER
```

### 3.2 발행 개념의 분해

과거의 "발행"은 여러 책임이 섞인 사용자 액션이었다.

```mermaid
flowchart LR
  P["기존 발행 버튼"] --> A["Drive 공개 권한 부여"]
  P --> B["guestUrl 계산"]
  P --> C["published.json 저장"]
  P --> D["readiness probe"]
  P --> E["캐시 revalidate"]

  A --> A2["현재: invitationVisibility"]
  B --> B2["현재: meta.json guestUrl"]
  C --> C2["현재: meta.json published"]
  D --> D2["현재: guestReadiness / pending / 토글 후 polling"]
  E --> E2["현재: invitationVisibility 내부 revalidate"]
```

---

## 4. 핵심 데이터 모델 변화

### 4.1 `published.json` 제거 방향과 `meta.json` 도입

기존에는 공개 상태와 공유 메타데이터가 여러 파일로 나뉘어 있었다.

```mermaid
flowchart LR
  subgraph OLD["이전"]
    PJSON["published.json<br/>publishedUrl / 발행 상태"]
    KJSON["kakao-share.json<br/>카카오 공유 메타"]
  end

  subgraph NEW["현재 목표 구조"]
    MJSON["meta.json<br/>published<br/>guestUrl<br/>dataJsonFileId<br/>kakaoShare<br/>updatedAt"]
  end

  PJSON -. "대체" .-> MJSON
  KJSON -. "흡수" .-> MJSON
```

새 helper는 다음 파일에 있다.

```txt
app/api/drive/_lib/ensureInvitationMetaFile.ts
```

주요 역할:

- `meta.json` 검색
- 없으면 생성
- 있으면 업데이트
- 기존 payload를 안전하게 normalize
- `published`, `guestUrl`, `dataJsonFileId`, `kakaoShare`를 한 곳에서 관리

### 4.2 현재 카드 데이터 계약

```mermaid
classDiagram
  class InviteListItem {
    string folderId
    string name
    string invitationUuid
    string dataJsonFileId
    string guestUrl
    boolean published
    InvitationReadiness readiness
    boolean isPending
    string thumbnailUrl
    boolean hasKakaoShareData
  }

  class InvitationVisibilityResult {
    boolean ok
    boolean published
    boolean ready
    string guestUrl
    string dataJsonFileId
    string warning
    string error
    number status
  }

  class DashboardPendingInvitation {
    string invitationFolderId
    string invitationUuid
    string dataJsonFileId
    string guestUrl
    string thumbnailFileId
    string createdAt
    boolean published
    boolean ready
  }
```

---

## 5. 에디터 저장 플로우 변화

### 5.1 이전 저장 플로우

```mermaid
sequenceDiagram
  participant U as 사용자
  participant E as 에디터
  participant S as saveInvitationFlow
  participant D as Drive
  participant P as publish hook

  U->>E: 저장 클릭
  E->>S: 파일 업로드 + data.json 저장
  S-->>E: 저장 성공
  E-->>U: 다시 수정하기 / 초대장 URL 만들기
  U->>P: 초대장 URL 만들기 클릭
  P->>D: 공개 권한 부여
  P->>D: published.json 저장
  P->>P: readiness polling
  P-->>U: URL 제공
```

### 5.2 현재 저장 플로우

```mermaid
sequenceDiagram
  participant U as 사용자
  participant E as 에디터
  participant S as saveInvitationFlow
  participant SH as shareUrl API
  participant IV as invitationVisibility API
  participant SS as sessionStorage
  participant D as 대시보드

  U->>E: 저장 클릭
  E->>S: prepare -> upload -> commit
  S->>SH: meta.json에 kakaoShare / guestUrl / dataJsonFileId 저장
  S->>IV: visible=true 초기 공개 요청
  IV-->>S: published / ready / guestUrl 반환
  S-->>E: SaveInvitationFlowResult 반환
  E-->>U: 다시 수정하기 / 여기서 나가기
  U->>E: 여기서 나가기 클릭
  E->>SS: DashboardPendingInvitation 저장
  E->>D: router.replace('/dashboard')
```

변경된 코드 위치:

```txt
features/invitation/save/saveInvitationFlow.ts
widgets/editor/preview/hooks/useInvitationUpload.ts
widgets/editor/preview/components/SaveModal.tsx
shared/constants/dashboardPendingInvitation.ts
```

중요한 정책:

- `meta.json` 저장 실패는 전체 저장 실패로 본다.
- 저장 필수 단계가 성공한 경우에만 초기 공개 요청을 수행한다.
- 초기 공개 권한 요청 실패는 저장 실패로 본다.
- 초기 공개 요청은 성공했지만 readiness가 아직 false인 경우는 저장 성공으로 보고 대시보드 pending에서 이어서 확인한다.
- "여기서 나가기"는 `router.replace('/dashboard')`로 이동하여 뒤로가기로 저장 직후 모달로 돌아가지 않게 한다.

---

## 6. 대시보드 pending / readiness 구조

### 6.1 Pending과 readiness의 분리

이번 리팩토링에서 가장 중요한 상태 분리는 다음이다.

```mermaid
flowchart TB
  A["pending"] -->|"방금 만든 초대장이 Drive 목록 / meta에 반영되는지 확인"| B["대시보드 카드 동기화 문제"]
  C["readiness"] -->|"guestUrl로 data.json을 실제로 읽을 수 있는지 확인"| D["게스트 접근 가능성 문제"]

  B --> E["sessionStorage handoff가 있을 때만 강하게 적용"]
  D --> F["공개 전환 / 방금 만든 공개 초대장에 적용"]
```

### 6.2 방금 만든 초대장의 pending 완료 조건

현재 pending 카드는 다음 조건을 만족해야 완료된다.

```mermaid
flowchart TD
  S["대시보드 진입"] --> P["sessionStorage pending payload 읽기"]
  P --> R["세션 payload 즉시 삭제"]
  R --> C["임시 카드 삽입"]
  C --> L["/api/drive/loadInvitation polling"]
  L --> F{"Drive 목록에<br/>folderId가 보이는가?"}
  F -- "아니오" --> W1["pending 유지"]
  F -- "예" --> M{"meta에서<br/>dataJsonFileId + guestUrl 확보?"}
  M -- "아니오" --> W2["pending 유지"]
  M -- "예" --> PUB{"처음부터 공개로<br/>시작한 초대장인가?"}
  PUB -- "아니오" --> DONE1["idle로 완료"]
  PUB -- "예" --> G["/api/drive/guestReadiness 실행"]
  G --> READY{"guest data ready?"}
  READY -- "아니오" --> W3["checking 유지"]
  READY -- "예" --> DONE2["ready로 완료"]
```

코드 위치:

```txt
app/dashboard/hooks/useDashboardInvitations.ts
```

관련 상수:

```txt
READINESS_POLL_DELAYS_MS = [1000, 1500, 2500, 4000, 6000]
PENDING_INVITATION_POLL_DELAYS_MS = [1000, 1500, 2500, 4000, 6000]
PENDING_INVITATION_MAX_ATTEMPTS = 10
```

무한 pending 방지:

- 최대 10회까지만 pending polling을 수행한다.
- 끝까지 완료되지 않으면 `readiness: 'failed'`, `isPending: false`로 전환한다.
- 실패 정보는 `warning: 'pending_sync_timeout'`으로 `invitationResults`에 남긴다.

### 6.3 일반 과거 초대장의 readiness

과거 초대장은 dashboard mount 때 전부 readiness probe를 돌리지 않는다.

```mermaid
flowchart LR
  A["과거 초대장 로드"] --> B["meta.json 확인"]
  B --> C{"published?"}
  C -- "false" --> D["readiness = idle"]
  C -- "true" --> E{"guestUrl + dataJsonFileId 있음?"}
  E -- "예" --> F["readiness = ready로 간주"]
  E -- "아니오" --> G["readiness = failed"]
```

이 정책은 과거 발행 구조와 비슷하다. 예전에도 오래된 초대장 전체를 백그라운드 probe하지 않고, 사용자가 발행/재발행 액션을 했을 때 readiness를 확인했다. 현재는 그 시점이 "공개 토글"로 이동했다.

---

## 7. 공개/비공개 토글 구조

### 7.1 새 API

```txt
POST /api/drive/invitationVisibility
```

요청:

```ts
{
  invitationFolderId: string;
  visible: boolean;
}
```

응답:

```ts
{
  ok: boolean;
  published?: boolean;
  ready?: boolean;
  guestUrl?: string;
  dataJsonFileId?: string;
  warning?: string;
  error?: string;
  status?: number;
}
```

코드 위치:

```txt
app/api/drive/invitationVisibility/route.ts
app/api/drive/_lib/publishPermissionWithRetry.ts
app/api/drive/_lib/revokePublicPermissionWithRetry.ts
app/api/drive/_lib/guestReadiness.ts
```

### 7.2 공개 전환

```mermaid
sequenceDiagram
  participant U as 사용자
  participant C as 대시보드 카드
  participant H as useDashboardInvitations
  participant API as invitationVisibility
  participant D as Google Drive
  participant M as meta.json
  participant R as guestReadiness

  U->>C: 공개 토글 ON
  C->>H: handleToggleVisibility(folderId, true)
  H->>API: POST visible=true
  API->>D: invitation folder anyone:reader 부여
  API->>M: published=true, guestUrl, dataJsonFileId 저장
  API->>R: waitUntilGuestReady
  alt ready
    API-->>H: ready=true
    H->>C: readiness=ready
  else 아직 전파 전
    API-->>H: 202, ready=false
    H->>R: pollGuestReadiness
    H->>C: readiness=checking
  end
```

### 7.3 비공개 전환

```mermaid
sequenceDiagram
  participant U as 사용자
  participant C as 대시보드 카드
  participant H as useDashboardInvitations
  participant API as invitationVisibility
  participant D as Google Drive
  participant M as meta.json

  U->>C: 공개 토글 OFF
  C->>H: handleToggleVisibility(folderId, false)
  H->>API: POST visible=false
  API->>D: invitation folder의 anyone permission 조회
  API->>D: anyone permission 삭제
  API->>M: published=false 저장
  API-->>H: published=false, ready=false
  H->>C: readiness=idle
```

중요한 Drive 권한 정책:

- 공개 권한은 초대장 루트 폴더에 부여한다.
- 하위 `data.json`, 이미지, 오디오, 썸네일은 폴더 권한 상속을 기대한다.
- 비공개 전환은 초대장 루트 폴더의 `anyone` permission을 삭제한다.
- 현재 구현은 하위 파일의 개별 public permission을 따로 순회 삭제하지 않는다.

---

## 8. 공유 / URL 복사 정책 변화

공유와 URL 복사는 공개 상태와 독립적으로 동작하도록 변경되었다.

```mermaid
flowchart TD
  A["카카오 공유 또는 URL 복사 클릭"] --> B{"카드가 비공개인가?"}
  B -- "예" --> C["info toast: 현재 초대장은 비공개 상태입니다."]
  B -- "아니오" --> D["토스트 없음"]
  C --> E["그래도 실제 공유/복사 수행"]
  D --> E
```

코드 위치:

```txt
app/dashboard/hooks/useDashboardInvitations.ts
app/dashboard/components/carousel/item/CarouselItem.tsx
app/dashboard/components/carousel/item/actions/DashboardActionButton.tsx
```

변경 내용:

- 비공개 상태에서도 카카오 공유 버튼과 URL 복사 버튼을 막지 않는다.
- 비공개 상태에서 누르면 info toast만 먼저 띄운다.
- 이후 실제 카카오 공유 또는 클립보드 복사는 그대로 실행한다.
- 카카오 공유 버튼 클릭 시 투명해지는 disabled/active 계열 시각 변화는 제거하고 hover 중심으로 정리했다.

---

## 9. 대시보드 이미지 로딩 개선

초기 캐러셀에서 썸네일이 늦게 뜨거나 깨져 보이는 문제를 줄이기 위해 초기 카드 이미지 preload가 추가되었다.

```mermaid
flowchart LR
  A["대시보드 invites"] --> B["reverse order"]
  B --> C["startIndex = 마지막 카드"]
  C --> D["마지막 카드 기준 최대 5개 preload"]
  D --> E{"thumbnail preload 성공?"}
  E -- "예" --> F["thumbnail 사용"]
  E -- "아니오" --> G["showcase fallback preload"]
  G --> H["fallback 사용"]
  F --> I["캐러셀 렌더"]
  H --> I
  I --> J["나머지 이미지는 background preload"]
```

코드 위치:

```txt
app/dashboard/components/carousel/CarouselWrapper.tsx
app/dashboard/components/carousel/carouselTypes.ts
app/dashboard/components/carousel/item/CarouselItem.tsx
```

정책:

- 초기 화면에 가까운 카드 5개를 먼저 preload한다.
- 초기 5개가 준비되기 전에는 skeleton을 유지한다.
- 썸네일이 실패하면 showcase fallback 이미지를 사용한다.
- 나머지 카드는 초기 렌더 후 background로 preload한다.

---

## 10. 게스트 페이지 비공개 안내 UI

비공개 초대장을 열었을 때 무조건 Next 404로 보내지 않고, Drive 응답을 분석해 비공개 안내 UI를 보여주도록 변경했다.

```mermaid
flowchart TD
  A["/guest/{dataJsonFileId} 접근"] --> B["Drive public download fetch"]
  B --> C{"HTTP status"}
  C -- "401 / 403 / 404" --> P["비공개 안내 UI"]
  C -- "200 OK" --> D["body text 확인"]
  D --> E{"HTML 응답인가?<br/><!doctype 또는 <html"}
  E -- "예" --> P
  E -- "아니오" --> F["JSON.parse"]
  F --> G{"GuestPayload schema valid?"}
  G -- "예" --> H["초대장 렌더"]
  G -- "아니오" --> N["notFound()"]
  F -- "parse 실패" --> N
```

코드 위치:

```txt
app/guest/[id]/page.tsx
```

처리한 문제:

- 비공개 Drive 파일이 항상 `403` 또는 `404`로만 오지 않는다.
- 공개 URL fetch가 `200 OK`인데 body가 JSON이 아니라 `<!doctype ...` HTML인 경우가 있다.
- `generateMetadata()`에서도 같은 응답을 JSON으로 파싱하다가 콘솔 SyntaxError가 발생했다.

현재 정책:

- `401`, `403`, `404`는 비공개 안내 UI로 처리한다.
- `200 OK`여도 body가 HTML이면 비공개 안내 UI로 처리한다.
- `generateMetadata()`는 HTML 또는 JSON 파싱 실패 시 `{}`를 반환해 콘솔 SyntaxError를 만들지 않는다.

---

## 11. 모듈화 지도

```mermaid
flowchart TB
  subgraph Editor["Editor"]
    A1["saveInvitationFlow.ts"]
    A2["useInvitationUpload.ts"]
    A3["SaveModal.tsx"]
  end

  subgraph Shared["Shared"]
    B1["dashboardPendingInvitation.ts"]
  end

  subgraph DriveAPI["Drive API"]
    C1["shareUrl/route.ts"]
    C2["invitationVisibility/route.ts"]
    C3["guestReadiness/route.ts"]
  end

  subgraph DriveLib["Drive Lib"]
    D1["ensureInvitationMetaFile.ts"]
    D2["publishPermissionWithRetry.ts"]
    D3["revokePublicPermissionWithRetry.ts"]
    D4["guestReadiness.ts"]
  end

  subgraph Dashboard["Dashboard"]
    E1["loadDashboardInvitations.ts"]
    E2["useDashboardInvitations.ts"]
    E3["dashboardInvitationState.ts"]
    E4["useDashboardInvitationTransientState.ts"]
    E5["CarouselWrapper.tsx"]
    E6["CarouselItem.tsx / ItemHeader.tsx"]
  end

  subgraph Guest["Guest"]
    F1["app/guest/[id]/page.tsx"]
  end

  A1 --> C1
  A1 --> C2
  A2 --> B1
  A3 --> B1
  B1 --> E2
  E1 --> D1
  E2 --> E3
  E2 --> E4
  E2 --> C2
  E2 --> C3
  C1 --> D1
  C2 --> D1
  C2 --> D2
  C2 --> D3
  C2 --> D4
  C3 --> D4
  F1 --> D4
```

---

## 12. 과거 기능이 현재 어디로 이동했는가

| 과거 기능                 | 과거 위치                                              | 현재 위치                                                | 설명                                                                  |
| ------------------------- | ------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------- |
| 저장 성공 후 발행 유도    | `SaveModal`, `useInvitationPublish`                    | `SaveModal`, `useInvitationUpload`, `saveInvitationFlow` | 저장 성공 후 "초대장 URL 만들기" 대신 "여기서 나가기"로 대시보드 이동 |
| 발행 hook                 | `widgets/editor/preview/hooks/useInvitationPublish.ts` | 제거됨                                                   | 에디터에서 발행 책임 제거                                             |
| 공개 권한 부여            | `publishInvitation` 중심                               | `invitationVisibility`                                   | 공개/비공개를 하나의 API에서 처리                                     |
| 공개 권한 회수            | 없음                                                   | `revokePublicPermissionWithRetry`                        | 초대장 폴더의 `anyone` permission 삭제                                |
| published 상태 저장       | `published.json`                                       | `meta.json.published`                                    | 공개 여부의 SSOT를 `meta.json`으로 이동                               |
| 카카오 공유 메타 저장     | `kakao-share.json`                                     | `meta.json.kakaoShare`                                   | 기존 파일 fallback 제거, `shareUrl` API 이름만 유지                   |
| guest URL                 | `publishedUrl`                                         | `guestUrl`                                               | 런타임 타입과 훅에서 `guestUrl`로 통일                                |
| readiness probe           | publish 액션 내부                                      | `guestReadiness`, pending polling, 공개 토글 후 polling  | 공개 전환 또는 방금 만든 공개 초대장에 집중                           |
| 방금 만든 초대장 보정     | 없음                                                   | sessionStorage pending handoff                           | Drive 목록 전파 지연을 대시보드 카드 단위로 흡수                      |
| 비공개 초대장 게스트 접근 | 404                                                    | 비공개 안내 UI                                           | Drive 401/403/404 및 HTML 응답 처리                                   |
| 초기 카드 이미지 표시     | 렌더 후 이미지 로드                                    | 초기 5개 preload + fallback                              | 캐러셀 첫 화면의 끊김 완화                                            |

---

## 13. 레거시 제거 결과와 남은 정리 후보

이번 잔재 정리로 런타임 코드의 주요 호환 경로는 제거되었다.

```mermaid
flowchart TB
  A["제거 완료"] --> B["publishInvitation route"]
  A --> C["publishInvitation/readiness route"]
  A --> D["publishedUrl 런타임 alias"]
  A --> E["ensureShareUrlFile / kakao-share.json fallback"]
  A --> F["published.json helper"]

  G["남은 정리 후보"] --> H["테스트 파일의 과거 기대값"]
  G --> I["문서/주석의 과거 흐름 설명"]
  G --> J["Drive에 이미 남아 있는 과거 파일 자체"]
```

제거된 런타임 항목:

- `app/api/drive/publishInvitation/route.ts`
- `app/api/drive/publishInvitation/readiness/route.ts`
- `app/api/drive/_lib/ensureShareUrlFile.ts`
- `app/api/drive/_lib/ensurePublishedJsonFile.ts`
- `InviteListItem.publishedUrl`
- `useDashboardInvitations`의 `handlePublish`, `getPublishedUrl`, `handleCopyPublishedUrl`, `isPublishing` 계열 alias
- `shareUrl` API의 `kakao-share.json` 검색/다운로드 fallback

현재 유지하는 항목:

- `/api/drive/shareUrl` 경로 이름
  - 외부 의미는 여전히 "공유 데이터 저장/조회"이므로 이름은 유지한다.
  - 내부 구현은 `meta.json.kakaoShare` 전용이다.
- 초대장 폴더 단위 permission 정책
  - 비공개 전환 시 하위 파일을 순회하지 않고 초대장 폴더의 `anyone` permission만 제거한다.

남은 정리 후보:

- 테스트 파일들
  - 일부 테스트는 여전히 `publishInvitation`, `publishedUrl`, `kakao-share.json` fallback을 기대한다.
  - 사용자가 테스트 정리는 나중에 한 번에 한다고 했으므로 이번 정리에서는 건드리지 않았다.
- 기존 Drive 데이터
  - 이미 생성된 `published.json` 또는 `kakao-share.json` 파일 자체는 Drive에 남아 있을 수 있다.
  - 런타임 코드는 더 이상 해당 파일을 읽지 않는다.

---

## 14. 현재 구조에서의 상태 전이

```mermaid
stateDiagram-v2
  [*] --> Saved
  Saved --> InitialPublishRequested: saveInvitationFlow 성공
  InitialPublishRequested --> DashboardPending: ready=false 또는 Drive 전파 대기
  InitialPublishRequested --> PublicReady: ready=true

  DashboardPending --> Pending: folder/meta 미확인
  Pending --> Checking: folder/meta 확인 + public
  Checking --> PublicReady: guestReadiness ready
  Pending --> Failed: max attempts 초과
  Checking --> Failed: max attempts 초과

  PublicReady --> PrivateIdle: 토글 OFF
  PrivateIdle --> Checking: 토글 ON
  Checking --> PublicReady: readiness ready
  Checking --> Failed: readiness 실패 지속
```

상태 의미:

| 상태       | 의미                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| `idle`     | 비공개이거나 readiness 확인이 필요 없는 일반 상태                              |
| `pending`  | 방금 만든 초대장이 Drive 목록 또는 `meta.json`에 아직 반영되지 않음            |
| `checking` | `guestUrl`과 `dataJsonFileId`는 있지만 게스트 data.json 접근 가능 여부 확인 중 |
| `ready`    | 공개 초대장으로 게스트 페이지 접근 가능하다고 판단                             |
| `failed`   | pending 또는 readiness 확인이 제한 횟수 내 완료되지 않음                       |

---

## 15. 기능별 검증 관점

수동 확인 시 다음 시나리오를 보면 된다.

```mermaid
mindmap
  root((검증 시나리오))
    저장
      저장 성공
      초기 공개 권한 부여
      여기서 나가기 replace 이동
    대시보드
      pending 카드 생성
      pending 종료
      초기 5개 이미지 preload
    공개/비공개
      공개 토글 ON
      공개 토글 OFF
      readiness checking
    공유
      공개 상태 공유
      비공개 상태 공유 + info toast
      비공개 상태 URL 복사 + info toast
    게스트
      공개 초대장 렌더
      비공개 초대장 안내 UI
      Drive HTML 응답 처리
```

---

## 16. 요약

현재 리팩토링은 다음 방향으로 거의 정리된 상태다.

- 에디터는 저장과 대시보드 handoff만 담당한다.
- 저장 과정에서 `meta.json` 저장과 초기 공개 권한 요청까지 수행한다.
- 대시보드는 방금 만든 초대장의 Drive 전파 지연을 pending 카드로 흡수한다.
- 공개/비공개 상태는 `meta.published`와 Drive folder permission이 함께 움직인다.
- readiness probe는 모든 카드에 무차별 실행하지 않고, 방금 만든 공개 초대장과 공개 전환 액션에 집중한다.
- 공유/URL 복사는 공개 여부와 독립적으로 동작하되, 비공개 상태에서는 안내 toast를 먼저 보여준다.
- 비공개 guest 접근은 404 대신 전용 안내 UI로 처리한다.

남은 작업은 큰 구조 변경보다 **테스트 정리와 문서/주석 정리**에 가깝다. 런타임 기준으로는 `publishInvitation`, `publishedUrl`, `kakao-share.json` fallback이 제거되었고, 새 구조는 `meta.json`, `guestUrl`, `invitationVisibility`, `guestReadiness` 중심으로 통일되었다.
