# 저장 Prepare 리팩토링 실행 계획

## 목적

저장 과정에서 Google Drive API 요청을 줄이고, 같은 에디터 세션에서 반복 저장할 때 불필요한 `prepare`를 스킵한다.

이번 리팩토링의 범위는 신규 초대장 생성과 저장 흐름이다. 재편집 최적화는 다른 담당자가 진행하므로 이 문서는 재편집 로딩 API 변경을 전제로 하지 않는다.

## 최종 판단

이번 작업에서는 세션 확인과 워크스페이스 확인을 로그인 시점으로 끌어오지 않는다.

이유는 다음과 같다.

```txt
로그인 시점 선처리는 전체 API 요청 수를 줄이지 않는다.
저장 버튼 클릭 이후의 체감 대기 시간만 일부 줄일 수 있다.
구경만 하고 나가는 사용자에게도 Drive 관련 요청이 발생할 수 있다.
서비스 방문자 전체 기준으로는 오히려 API 요청 총량이 늘 수 있다.
```

따라서 세션과 워크스페이스 확인은 저장 또는 초대장 생성 의도가 확인된 뒤 수행한다.

반면 새 초대장 생성에서 하위 리소스를 "보장"하기 위해 매번 검색하는 API는 줄인다.

```txt
방금 invitation folder를 새로 만들었다면
  -> 그 하위의 data.json, images, audios는 아직 없다고 볼 수 있음
  -> 검색해서 보장하지 말고 바로 생성한다.
```

이 부분은 실제 Google Drive API 요청 수를 줄일 수 있다.

## 현재 구조

현재 저장 흐름은 `features/invitation/save/saveInvitationFlow.ts`에서 다음 순서로 실행된다.

```txt
saveInvitationFlow
  -> prepare
  -> upload
  -> commit
```

현재 `prepare`는 `/api/drive/saveInvitation`을 호출한다.

`/api/drive/saveInvitation`은 다음 작업을 한 번에 수행한다.

```txt
getFreshAccessToken
ensureWorkspace
ensureInvitationFolder
ensureDataJsonFile
ensureAssetsFolder
```

즉 현재 prepare는 다음 두 성격을 동시에 가진다.

```txt
세션 준비
  - access token 갱신

Drive 구조 준비
  - workspace folder
  - invitation folder
  - data.json
  - images/audios folder
```

## 세션에 대한 냉정한 평가

세션을 prepare에서 완전히 떼어내서 로그인 시점에 처리하는 방향은 이번 목표와 맞지 않는다.

현재 코드에서 `getFreshAccessToken()`은 저장 체인의 시작점에서 최신 access token을 확보하는 역할을 한다. 이후 upload와 commit은 같은 `TokenState`를 공유하고, 중간에 401이 발생하면 `/api/drive/getToken`으로 한 번 갱신한다.

이 구조의 장점은 다음이다.

```txt
긴 저장 체인을 시작하기 전에 토큰 상태를 최신화한다.
upload와 commit이 같은 토큰 상태를 공유한다.
중간 401 발생 시 이후 단계도 갱신된 토큰을 사용한다.
```

따라서 세션 관련 로직은 계속 저장 체인에 붙어 있어야 한다. 다만 Drive 구조 확인과는 분리해서 다룬다.

권장 결론:

```txt
세션 갱신은 저장 시작 시점에 수행한다.
메타데이터가 캐시되어 있어도 access token이 없거나 만료되면 token만 갱신한다.
token만 갱신할 수 있는 상황에서는 invitation prepare를 다시 호출하지 않는다.
로그인 시점 token/workspace prefetch는 이번 범위에서 하지 않는다.
```

즉 목표는 "세션까지 무조건 스킵"이 아니라 "구조 prepare는 스킵하고 세션은 필요한 만큼 독립 갱신"이다.

## 개선 방향

### 1. 신규 초대장 direct-create 경로 추가

현재는 새 초대장에서도 하위 리소스를 보장한다.

```txt
data.json 검색
data.json 생성
data.json 기본 payload PATCH
images/audios 폴더 검색
images 폴더 생성
audios 폴더 생성
```

신규 초대장에서는 다음으로 바꾼다.

```txt
invitation folder 생성
data.json 생성
data.json 기본 payload PATCH
images 폴더 생성
audios 폴더 생성
```

적용 조건:

```txt
invitationUuid가 없거나 새 uuid로 생성됨
ensureInvitationFolder 결과가 reused=false
```

적용하지 않는 조건:

```txt
invitationUuid가 들어온 저장
ensureInvitationFolder 결과가 reused=true
재편집 저장
Drive 상태가 불확실한 fallback 경로
```

이 조건에서는 기존 `ensureDataJsonFile`, `ensureAssetsFolder`를 유지한다.

### 2. 에디터 세션 메모리 캐시 추가

에디터 페이지를 벗어나지 않은 상태에서 반복 저장하면 첫 prepare 결과를 메모리에 보관한다.

캐시할 값:

```txt
workspaceFolderId
invitationFolderId
invitationUuid
dataJsonFileId
imageFolderId
audioFolderId
accessToken
expiresAt
```

새로고침하면 캐시는 사라져도 된다. 현재 서비스는 새로고침 시 작성 중인 내용이 유지되지 않으므로 이 제약과 맞다.

주의:

```txt
accessToken은 Zustand/devtools에 오래 보관하지 않는다.
필요하다면 save feature 내부 module memory에만 둔다.
sessionStorage/localStorage에는 token을 저장하지 않는다.
```

### 3. 저장 시 prepare 스킵 판단 추가

저장 버튼 클릭 시 다음 순서로 판단한다.

```txt
1. 같은 invitationUuid의 prepared metadata가 있는지 확인한다.
2. dataJsonFileId, imageFolderId, audioFolderId가 모두 있는지 확인한다.
3. access token이 있고 만료되지 않았는지 확인한다.
4. metadata와 token이 모두 유효하면 prepare를 스킵한다.
5. metadata는 유효하지만 token만 없거나 만료되었으면 /api/drive/getToken만 호출한다.
6. metadata가 없으면 기존 prepare 또는 신규 direct-create prepare를 실행한다.
7. upload를 실행한다.
8. commit을 실행한다.
```

핵심은 token 만료와 구조 메타데이터 부재를 분리하는 것이다.

```txt
token 문제
  -> token만 갱신

folder/file id 문제
  -> prepare fallback
```

### 4. in-flight prepare 중복 방지

저장 버튼을 빠르게 여러 번 누르거나, 에디터 진입 직후 prepare가 끝나기 전에 저장할 수 있다.

같은 초대장에 대한 prepare는 동시에 여러 번 실행하지 않는다.

```ts
const inFlightPrepare = new Map<string, Promise<PreparedInvitationSave>>();
```

동작:

```txt
같은 invitationUuid로 prepare 진행 중
  -> 새 요청을 만들지 않고 기존 promise를 await

prepare 성공
  -> cache 저장
  -> in-flight 제거

prepare 실패
  -> in-flight 제거
  -> 에러 반환
```

신규 초대장처럼 아직 uuid가 없다면 클라이언트 draft id 또는 임시 key를 쓴다.

## fallback 정책

prepare를 스킵하면 fallback이 반드시 있어야 한다.

### 401

의미:

```txt
access token 만료 또는 무효
```

대응:

```txt
/api/drive/getToken 호출
실패한 upload 또는 commit 단계 1회 재시도
```

### 403

의미:

```txt
권한 문제
계정 변경 가능성
Drive 파일 권한 변경 가능성
```

대응:

```txt
prepared metadata 폐기
prepare 재실행
upload 또는 commit 1회 재시도
```

### 404

의미:

```txt
캐시된 folderId 또는 dataJsonFileId가 더 이상 존재하지 않음
사용자가 Drive에서 파일을 지웠을 가능성
```

대응:

```txt
prepared metadata 폐기
prepare 재실행
upload 또는 commit 1회 재시도
```

### 429

의미:

```txt
Google Drive rate limit
```

대응:

```txt
prepare 재실행 금지
즉시 반복 재시도 금지
사용자에게 잠시 후 다시 시도 안내
필요하면 backoff 적용
```

### 5xx

의미:

```txt
일시적인 서버 또는 Google 장애 가능성
```

대응:

```txt
현재 단계 1회 재시도
계속 실패하면 저장 실패 처리
```

한 번의 저장 클릭에서 허용하는 최대 재시도:

```txt
token refresh fallback: 1회
prepare fallback: 1회
5xx retry: 단계별 1회
429 retry: 즉시 재시도 없음
```

## 구현 단계

### 1단계. 타입 정리

`shared/types/invitationSave.ts` 또는 save feature 내부 타입으로 prepared metadata를 정의한다.

```ts
export type PreparedInvitationSave = {
  workspaceFolderId: string;
  invitationFolderId: string;
  invitationUuid: string;
  dataJsonFileId: string;
  imageFolderId: string;
  audioFolderId: string;
  accessToken: string;
  expiresAt: number;
};
```

기존 `SaveInvitationPrepareResponse`와 중복되지 않게 정리한다.

### 2단계. 신규 생성용 direct-create helper 추가

서버 helper를 추가한다.

```txt
createDataJsonFile(invitationFolderId)
createAssetsFolders(invitationFolderId)
```

역할:

```txt
검색하지 않고 바로 생성한다.
data.json은 생성 후 기본 payload를 PATCH한다.
images/audios는 각각 생성한다.
```

주의:

```txt
이 helper는 새 invitation folder가 방금 생성된 경우에만 사용한다.
재편집이나 reused=true 경로에서는 사용하지 않는다.
```

### 3단계. `/api/drive/saveInvitation` 내부 분기

현재 route는 유지하되 내부에서 분기한다.

```txt
getFreshAccessToken
ensureWorkspace
ensureInvitationFolder

if invitationReused=false:
  createDataJsonFile
  createAssetsFolders
else:
  ensureDataJsonFile
  ensureAssetsFolder
```

이렇게 하면 외부 API 계약을 크게 바꾸지 않고 신규 생성 요청 수를 줄일 수 있다.

### 4단계. prepare cache 추가

파일 후보:

```txt
features/invitation/save/prepareCache.ts
```

역할:

```txt
prepared metadata 저장
token 만료 여부 판단
in-flight prepare dedupe
cache invalidate
```

sessionStorage는 1차에서 쓰지 않는다.

### 5단계. `saveInvitationFlow` prepare 판단 변경

현재:

```txt
prepare 항상 실행
```

변경:

```txt
usable prepared metadata 있음 + token 유효
  -> prepare 스킵

usable prepared metadata 있음 + token 만료
  -> /api/drive/getToken
  -> prepare 스킵

prepared metadata 없음
  -> /api/drive/saveInvitation
```

### 6단계. fallback 연결

현재 upload/commit의 401 재시도는 이미 token refresh 흐름이 있다.

추가로 필요한 것은 구조 메타데이터가 깨진 경우의 fallback이다.

```txt
403/404 발생
  -> cache invalidate
  -> prepare 1회 재실행
  -> 실패한 단계 1회 재시도
```

429에서는 prepare 재실행을 하지 않는다.

### 7단계. 테스트

우선순위 높은 테스트:

```txt
신규 invitation folder 생성 시 하위 리소스 검색 없이 direct-create를 사용한다.
invitationReused=true면 기존 ensure 경로를 사용한다.
prepared metadata와 유효 token이 있으면 /api/drive/saveInvitation을 호출하지 않는다.
metadata는 있고 token만 만료되면 /api/drive/getToken만 호출한다.
404 발생 시 cache를 폐기하고 prepare fallback을 1회만 수행한다.
429 발생 시 prepare fallback을 수행하지 않는다.
```

## 기대 효과

이번 리팩토링으로 개선되는 부분:

```txt
새 초대장 생성 시 data.json/images/audios 검색 요청 감소
같은 에디터 세션의 반복 저장에서 prepare 전체 스킵
token 갱신과 Drive 구조 prepare의 책임 분리
prepare 스킵 실패 시 에러 코드별 복구 경로 명확화
```

개선되지 않는 부분:

```txt
로그인만 하고 나가는 사용자에 대한 선처리 없음
전체 방문자 기준 API 요청을 로그인 시점으로 분산하지 않음
재편집 로딩 응답 최적화는 이번 범위에서 제외
```

## 최종 권장안

```txt
1. 로그인 시점 session/workspace prepare는 하지 않는다.
2. 저장 시작 시점의 token 최신화는 유지한다.
3. token 갱신은 Drive 구조 prepare와 분리한다.
4. 신규 초대장 생성에서는 하위 리소스를 검색하지 않고 direct-create한다.
5. reused=true 또는 재편집 경로에서는 기존 ensure 방식을 유지한다.
6. 에디터 세션 안에서는 prepared metadata를 메모리 캐싱한다.
7. 반복 저장에서는 metadata 유효성과 token 유효성을 검사한 뒤 prepare를 스킵한다.
8. 401은 token refresh, 403/404는 prepare fallback, 429는 즉시 재시도 금지로 분리한다.
9. 한 번의 저장 클릭에서 prepare fallback은 최대 1회만 허용한다.
```

이 방향은 단순히 요청 시점을 옮기는 것이 아니라, 신규 생성에서 실제 불필요한 Drive 검색을 제거하고 반복 저장에서 prepare를 생략하는 구조다.
