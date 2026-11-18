# 인비아 Google Drive 접근 경계 점검

- 확인일: 2026-11-17 (Asia/Seoul)
- 기준: 로컬 `feat/share-link-qr` 브랜치 및 기존 dev 코드. 운영 로그인 리다이렉트와 루트 응답 헤더는 읽기 전용으로 확인했다.
- 목적: 전체 Drive 접근 여부, 파일명 사칭에 의한 오인 접근, 연결된 Drive 데이터에 영향을 줄 수 있는 브라우저 코드 실행 경로 확인.
- 실제 사용자 파일 변경·삭제·공개, 토큰 열람·반출은 수행하지 않았다. 점검용 페이지와 테스트는 검증 후 제거했다.

## 판단

현재 신규 OAuth 요청은 `openid https://www.googleapis.com/auth/drive.file`이다. 운영 로그인 리다이렉트에서도 같은 값을 확인했다. Google이 적용하는 파일 단위 접근 제한이 있으므로, 파일 이름을 인비아 파일과 같게 바꾸는 것만으로 접근하지 않은 비공개 개인 파일에 대한 OAuth 접근권한이 생기지는 않는다.

그러나 현재 코드 전체에 대해 "인비아가 생성한 파일만 접근한다" 또는 "해킹에 안전하다"는 보장은 할 수 없다. 아래에서 확인한 HTML 실행 경로와 API별 소속 검증 누락을 우선 보완해야 한다. 실제 계정 침해 발생 여부나 모든 배포 경로의 보안 상태를 검증한 결과는 아니다.

## 확인된 보호 장치

1. `app/api/auth/_lib/googleScopes.ts`는 전체 Drive 권한 대신 `drive.file`을 요청한다.
2. `app/api/drive/_lib/findWorkspaceFolderId.ts`는 폴더명에 더해 `appProperties.app_id`를 검사한다.
3. `app/api/drive/_lib/ensureInvitationFolder.ts`는 workspace의 직계 자식 여부와 `app_id`, `kind`, `inv_id`를 함께 검색한다. 초대장 폴더명은 식별 조건으로 사용하지 않는다.
4. 에셋 폴더 검색은 초대장 부모 ID와 앱 표식, 에셋 종류를 검사한다.
5. 대시보드 미리보기는 `previewAccess.ts`의 `assertInvitationFolderAccess` 및 `assertDriveFileUnderInvitation`으로 workspace 소속과 부모 체인을 검사한다.
6. 로그인에는 OAuth state와 PKCE를 사용하며, 토큰 쿠키는 HttpOnly이고 운영 환경에서 Secure로 설정된다. 이것만으로 아래 HTML 실행 문제까지 차단되지는 않는다.

`appProperties`는 앱의 파일 분류 표식이며 Google의 OAuth 접근권한을 새로 부여하는 수단이 아니다. 또한 표식 자체가 파일 원생성자에 대한 변조 불가능한 증명은 아니다.

## 우선 보완 사항

### 1. [P1] 외부 저장 HTML의 이벤트 속성이 본문에서 실행 가능

- 입력 경로: `app/guest/[id]/validation/normalizeGuestBlock.ts`는 입력 props를 복사하고 기본값을 채운다. HTML의 이벤트 속성 등을 제거하지 않는다.
- 렌더 경로: `components/organisms/picture/PictureBlockPreview.tsx`는 `contentsHtml`을 `PreviewBody`로 전달한다. 공지·인터뷰 등에도 같은 공통 컴포넌트가 사용된다.
- 실행 지점: `components/atoms/preview-body/PreviewBody.tsx:22`는 HTML을 `dangerouslySetInnerHTML`에 그대로 전달한다.
- 무해한 로컬 검증: 임시 Jest/jsdom 테스트에서 이벤트 속성이 포함된 HTML을 실제 정규화 함수와 실제 `PreviewBody`에 전달했다. 이미지 오류 이벤트를 발생시키자 해당 이미지의 `data-security-probe` 속성이 `executed`로 바뀌었다.
- 이 검증은 코드 실행 가능한 HTML이 보존되는 경로를 재현했다. 실제 공개 초대장이나 피해자 세션에서 공격을 실행한 것은 아니다. 브라우저 확인용 임시 페이지는 개발 번들 순환 초기화 오류로 실행되지 않아, 브라우저 기반 전체 공격 재현은 완료하지 않았다.
- 운영 루트 응답에서 CSP 헤더는 관측되지 않았다. 모든 게스트 경로의 헤더를 확인한 것은 아니다.

공격자가 자신이 소유한 초대장 데이터를 조작해 방문자에게 열게 할 수 있다면 저장형 XSS로 이어질 수 있는 경로다. 실행된 동일 출처 스크립트는 로그인 사용자의 API를 호출할 수 있다. `app/api/drive/getToken/route.ts:11` 및 `saveInvitation/route.ts:69`가 access token을 JSON으로 반환하므로, HttpOnly 쿠키만을 근거로 토큰이 브라우저 코드에 노출되지 않는다고 설명해서는 안 된다. 실제 토큰 탈취는 시험하지 않았다.

권고: 허용 태그·속성·URL 프로토콜에 기반한 검증된 HTML 정제기를 렌더 경계에 적용하고, 저장 입력 경계도 검증한다. Tiptap UI가 정상 HTML을 생성한다는 가정은 Drive의 외부 수정 데이터까지 보장하지 않는다. CSP와 브라우저에 전달하는 토큰 범위·수명 축소를 추가 방어로 검토한다.

### 2. [P1] 변경 API의 초대장 소속 검증이 일관되지 않음

- `app/api/drive/deleteInvitation/route.ts:21`은 요청의 `folderId`를 받아 해당 ID에 바로 Drive DELETE를 전달한다. 초대장 폴더인지, 현재 workspace의 자식인지 확인하는 호출이 없다.
- 이 엔드포인트는 이미지 정리 흐름에서도 파일 ID를 전달받으므로, 수정 시 초대장 폴더 삭제와 에셋 정리 삭제를 각각 검증해야 한다.
- `app/api/drive/invitationVisibility/route.ts:64`는 전달된 폴더에 data.json을 보장하고 공개/비공개 권한을 변경하지만, 미리보기에서 쓰는 초대장 소속 검증을 먼저 수행하지 않는다.
- Google의 현재 토큰 범위 제한은 계속 적용된다. 위 누락이 곧 일반 비공개 개인 파일 전체에 접근할 수 있다는 뜻은 아니다. 앱에 추가로 허용된 파일 또는 더 넓은 기존 토큰이 존재하면 앱 자체 경계가 충분하지 않다.

권고: 읽기·수정·삭제·공개 API에서 공통으로 사용자/workspace/초대장/에셋 소속을 먼저 검사하고 실패 시 Google 변경 요청을 보내지 않는다. 생성 시 기록한 파일 ID와 사용자 계정의 연결을 신뢰할 수 있는 서버 기록 또는 서버 발급 검증 자료로 확인하면 "직접 생성한 파일만"이라는 요구를 더 엄격하게 적용할 수 있다.

### 3. [P2] 재편집 조회 일부는 외부 폴더 ID와 내부 파일명에 의존

- `app/api/drive/updateInvitation/route.ts`는 요청의 `id`를 `loadInvitations`에 전달한다.
- 이어서 하위의 `data.json` 및 이름에 `image`/`audio`가 포함된 폴더를 분류한다.
- 이 경로에는 초대장 부모·앱 표식 검증이 없다. `getSaveDataFetch.ts`의 일부 Drive 검색 쿼리도 입력 ID의 문자열 보간에 의존한다.
- 이 동작은 "Drive 전체에서 이름만으로 파일을 찾는다"와 다르지만, 모든 조회 경로가 앱 표식으로 제한된다고 설명할 수는 없다.

권고: 조회 시작 전에 공통 소속 검증을 수행하고, 내부 파일 식별에는 `kind` 및 앱 표식을 적용하며, ID 형식 검증과 쿼리 값 이스케이프를 통일한다.

### 4. 기존 승인 권한은 신규 요청과 구분해 확인해야 함

`app/api/auth/login/route.ts:52`의 `include_granted_scopes=true`는 같은 Google API 프로젝트에 과거 승인한 권한을 합칠 수 있다. 현재 `hasRequiredDriveScope`는 `drive.file`이 존재하는지만 확인하고 더 넓은 추가 권한을 거부하지 않는다. 실제 사용자 토큰의 scope는 이번 점검에서 확인하지 않았다.

권고: 서버가 신뢰하는 실제 발급 scope를 확인하고 최소 권한 정책을 적용한다. 기존의 광역 승인이 확인될 경우 그 사용자에 대한 별도 승인 철회·재동의 절차가 필요하다.

## 검증 범위와 우선순위

- 실제 정규화 함수 및 공통 HTML 렌더러를 사용한 임시 로컬 테스트에서 HTML 이벤트 실행을 확인했다.
- 기존 삭제 API 테스트 5개와 함께 총 6개 테스트가 통과했다. HTML 점검 테스트의 통과는 취약 경로가 재현되었다는 의미이며, 보안상 안전하다는 의미가 아니다.
- 정상 저장/목록 조회의 이름+앱 표식 검색과 미리보기 소속 검증을 코드에서 확인했다.
- 권고 순서: HTML 실행 방어 → 모든 Drive API 소속 검증 → 토큰 노출 및 실제 승인 scope 정책 점검.
- 실제 사용자 Drive를 대상으로 거부 응답이나 변경 성공을 시험하지 않았으며, 운영 전체에 대한 침투 테스트나 침해 로그 분석을 수행하지 않았다.

## 근거

- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://developers.google.com/workspace/drive/api/reference/rest/v3/files (`isAppAuthorized`는 생성 또는 앱에서 연 파일 여부이며, 생성 전용 증명이 아니다.)
- https://developers.google.com/identity/protocols/oauth2/web-server#incrementalAuth
