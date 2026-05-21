# Save Flow Split Report

## Summary

`saveInvitationFlow` 내부 저장 흐름을 `prepare`, `upload`, `commit` 세 단계로 분리했다.

외부 호출부의 사용 방식은 유지했다. 현재 에디터 저장 버튼은 여전히 `useInvitationUpload.handleUpload`에서 `saveInvitationFlow`를 호출하며, 이번 변경은 `saveInvitationFlow` 내부 구조를 정리하는 1차 작업이다.

현재 저장 유틸은 테스트 라우트 영역에서 분리되어 `features/invitation/save` 아래에 위치한다. 저장 payload 관련 공유 타입은 `shared/types/invitationSave.ts`에 위치한다.

```txt
features/invitation/save/saveInvitationFlow.ts
features/invitation/save/uploadFileToDrive.ts
features/invitation/save/updateFileToDrive.ts
features/invitation/save/uploadAllSettled.ts
features/invitation/save/retryFailedOnce.ts
features/invitation/save/retryPatchFailedOnce.ts

shared/types/invitationSave.ts
```

## Changed Flow

기존 흐름은 하나의 함수 안에서 준비, 파일 업로드, `data.json` 업데이트, 공유 데이터 저장, 썸네일 저장이 순차적으로 실행됐다.

변경 후 흐름은 다음과 같다.

```txt
saveInvitationFlow
  -> prepare
  -> upload
  -> commit
```

## prepare

`prepare`는 저장을 시작하기 위한 Drive 리소스를 준비한다.

현재는 기존 `/api/drive/saveInvitation` 호출을 이 단계로 분리했다.

```txt
prepare
  -> /api/drive/saveInvitation
  -> workspaceFolderId
  -> invitationFolderId
  -> invitationUuid
  -> dataJsonFileId
  -> imageFolderId
  -> audioFolderId
  -> accessToken
```

이 단계는 사용자 콘텐츠를 최종 저장하지 않는다. 이후 `upload`와 `commit`이 실행될 수 있는 상태를 만든다.

## upload

`upload`는 현재 전달받은 이미지와 오디오 파일 업로드를 담당한다.

이번 1차 작업에서는 기존 동작을 유지하기 위해 파일 변경 여부 판단이나 기존 `driveFileId` 재사용은 추가하지 않았다.

```txt
upload
  -> image upload
  -> audio upload
  -> uploaded fileId map 생성
```

업로드 실패 재시도와 토큰 갱신 흐름도 기존처럼 유지된다.

## commit

`commit`은 최종 저장 데이터를 구성하고 `data.json`을 PATCH한다.

현재 기존 동작 유지를 위해 공유 데이터 저장과 썸네일 저장도 아직 이 단계 안에 남겨두었다. 이후 별도 작업에서 카카오 공유와 썸네일 저장 정책을 다시 분리할 수 있다.

```txt
commit
  -> block/shareUrl 내부 File을 uploaded fileId로 치환
  -> BGM 데이터 구성
  -> 최종 payload 생성
  -> data.json PATCH
  -> /api/drive/shareUrl
  -> /api/drive/thumbnail
```

## Current Scope

이번 작업에 포함된 내용:

- `saveInvitationFlow` 내부를 `prepare`, `upload`, `commit`으로 분리
- 기존 API 호출 순서 유지
- 기존 반환값 형태 유지
- 기존 성공/실패 판단 기준 유지
- 토큰 갱신 상태를 세 단계에서 공유하도록 정리

이번 작업에 포함하지 않은 내용:

- 변경된 파일만 업로드
- 기존 `driveFileId` 재사용
- cleanup 단계
- 저장 단계별 UI 표시
- 썸네일/카카오 공유 저장 정책 변경

## Expected Effect

저장 로직의 실패 위치를 단계 단위로 해석하기 쉬워졌다.

```txt
prepare 실패 -> 저장 준비 실패
upload 실패  -> 파일 업로드 실패
commit 실패  -> 최종 데이터 확정 실패
```

또한 다음 작업을 붙일 위치가 명확해졌다.

- 재편집에서 기존 파일 재사용은 `upload` 안에서 확장 가능
- 단계별 저장 UI는 `saveInvitationFlow`가 `prepare`, `upload`, `commit` 진입 시 상태를 알려주는 방식으로 연결 가능
- cleanup은 `commit` 성공 이후 별도 단계로 추가 가능

이번 변경은 저장 동작을 최적화한 것이 아니라, 이후 안정성 개선과 재시도 처리를 넣기 위한 구조적 기반 작업이다.
