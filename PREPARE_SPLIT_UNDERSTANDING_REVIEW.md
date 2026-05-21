# Prepare 분리 판단 리뷰

## 결론

사용자 최종 판단에 동의한다.

이번 작업에서 로그인 시점으로 세션 확인과 워크스페이스 확인을 끌어오는 것은 하지 않는 편이 맞다. 이 방식은 저장 버튼 클릭 이후의 체감 대기 시간을 줄일 수는 있지만, 전체 API 요청 수를 줄이는 개선은 아니다.

오히려 다음 문제가 생길 수 있다.

```txt
초대장을 만들지 않는 방문자에게도 Drive 관련 요청이 발생한다.
자동 로그인 또는 홈 진입만으로 요청 총량이 증가할 수 있다.
부하 분산 효과는 있어도 API 비용 절감 효과는 불명확하다.
```

따라서 이번 리팩토링의 핵심은 로그인 선처리가 아니라 아래 두 가지다.

```txt
신규 초대장 생성에서 불필요한 하위 리소스 검색 제거
에디터 세션 안의 반복 저장에서 prepare 스킵
```

## 세션과 prepare 관계

현재 `prepare`가 세션 갱신을 포함하는 이유는 합리적이다.

저장 과정은 다음처럼 긴 체인이다.

```txt
prepare
upload images
upload audio
commit data.json
save share data
save thumbnail
```

이 체인을 시작하기 전에 `getFreshAccessToken()`으로 최신 토큰을 확보하면 중간 실패 가능성을 줄일 수 있다.

또한 현재 클라이언트 저장 흐름은 `TokenState`를 공유한다.

```txt
prepare에서 받은 accessToken으로 시작
upload/commit 중 401 발생
  -> /api/drive/getToken
  -> token.currentToken 갱신
  -> 이후 단계도 갱신된 token 사용
```

따라서 세션을 prepare에서 무조건 떼어내는 것은 위험하다.

더 정확한 방향은 다음이다.

```txt
세션 갱신은 저장 체인의 일부로 유지한다.
Drive 구조 확인은 캐시로 스킵할 수 있게 분리한다.
metadata가 유효하고 token만 만료되었으면 token만 갱신한다.
```

즉 "prepare 전체 스킵"은 항상 token 스킵을 뜻하지 않는다. 구조 메타데이터는 스킵하되, 세션은 필요할 때 독립적으로 갱신해야 한다.

## 신규 생성 최적화

새 초대장 생성에서 가장 확실히 줄일 수 있는 요청은 자식 리소스 검색이다.

현재 보장 방식:

```txt
invitation folder 검색 또는 생성
data.json 검색
data.json 생성
data.json 초기 PATCH
images/audios 검색
images 생성
audios 생성
```

새 초대장 direct-create 방식:

```txt
invitation folder 생성
data.json 생성
data.json 초기 PATCH
images 생성
audios 생성
```

적용 조건은 명확해야 한다.

```txt
invitation folder를 방금 새로 만들었고 reused=false인 경우에만 direct-create한다.
reused=true이면 기존 ensure 방식을 유지한다.
재편집 경로도 기존 ensure 또는 로딩 데이터 재사용을 사용한다.
```

이 분리는 중요하다. 신규 생성은 "없음을 알고 있는 상태"지만, 재편집은 "이미 있을 가능성이 높은 상태"다.

## 반복 저장 최적화

에디터 페이지를 벗어나지 않는 같은 세션에서는 prepare 결과를 메모리에 보관할 수 있다.

필요한 값:

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

저장 시 판단:

```txt
metadata 있음 + token 유효
  -> prepare 스킵

metadata 있음 + token 만료
  -> /api/drive/getToken만 호출
  -> prepare 스킵

metadata 없음
  -> prepare 실행
```

메모리 캐시는 새로고침하면 사라져도 된다. 현재 서비스는 새로고침 시 작성 중인 초대장이 유지되지 않기 때문에, 캐시의 생명주기도 이 동작과 맞다.

주의:

```txt
accessToken은 sessionStorage/localStorage에 넣지 않는다.
Zustand devtools에 오래 노출될 store에도 넣지 않는 편이 낫다.
save feature 내부 module memory 또는 함수 스코프에서 짧게 들고 있는 정도가 적절하다.
```

## fallback이 필요한 이유

prepare를 스킵하면 cached folder/file id가 깨졌을 때 복구 경로가 필요하다.

권장 분류:

```txt
401
  - token 문제
  - /api/drive/getToken 후 1회 재시도

403
  - 권한 또는 계정 문제
  - cache 폐기 후 prepare fallback 1회

404
  - cached id가 삭제되었거나 잘못됨
  - cache 폐기 후 prepare fallback 1회

429
  - rate limit
  - prepare 재실행 금지
  - 즉시 반복 재시도 금지

5xx
  - 일시 장애 가능성
  - 현재 단계 1회 재시도
```

제한:

```txt
한 번의 저장 클릭에서 token refresh는 최대 1회
한 번의 저장 클릭에서 prepare fallback은 최대 1회
429는 즉시 재시도하지 않음
```

이 제한이 없으면 실패 상황에서 오히려 API 요청을 더 많이 만들 수 있다.

## 재편집 범위

재편집 최적화는 이번 담당 범위가 아니다.

다만 인수인계용으로 기억할 점은 있다.

```txt
재편집 로딩 API는 data.json을 찾고 그 file id로 내용을 다운로드한다.
그 id를 응답에 포함하면 재편집 저장에서 prepare를 줄일 수 있다.
```

하지만 이 문서의 실행 계획은 신규 생성과 같은 에디터 세션 반복 저장에 한정한다.

## 최종 정리

```txt
1. 로그인 시점 선처리는 하지 않는다.
2. 저장 시작 시 token 최신화 의도는 유지한다.
3. token 갱신과 Drive 구조 prepare를 분리해서 생각한다.
4. 신규 생성에서는 하위 리소스 검색을 제거하고 direct-create한다.
5. reused=true 또는 재편집에서는 기존 ensure 방식을 유지한다.
6. 같은 에디터 세션 반복 저장은 메모리 캐시로 prepare를 스킵한다.
7. 모든 스킵은 에러 코드별 fallback과 재시도 제한을 전제로 한다.
```
