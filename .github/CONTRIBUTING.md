# 🎵 Contributing Guide

팀의 협업을 위해 아래 규칙을 지켜주세요.
## Code Style Guide

- Airbnb EsLint Config를 차용한다.
    [📌npm : eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb)
    
    [📌ESLint](https://www.notion.so/ESLint-2ae1acfb02348049b586ddd7bdc9f767?pvs=21)
    
    [📌Air bnb](https://www.notion.so/Air-bnb-2ae1acfb02348082aef1d81dfc934c7a?pvs=21)
    
- Husky 사용해서 자동 Linting.

---

## Branch Strategy

> **GitHub Flow**

---

## Pull Requests

- GitHub PR 템플릿 작성해서 사용한다.
- PR 템플릿 스크린샷 (추후 완성 후 추가할 예정!)

---

## Prefix

| type | 용도 |
| --- | --- |
| **feat** | 신규 기능 개발 |
| **api** | API 연동·수정 |
| **fix** | 버그 수정 |
| **refactor** | 구조 개선·코드 정리·성능 개선 |
| **chore** | 설정·빌드·잡무 |
| **docs** | 문서 작성·수정 |
| **test** | 테스트 코드 작성·보완 |

---

## Commit Message

> 형식 ⇒ **`[prefix] 한글 요약`**

- **Prefix**는 상단에 정의된 규칙(feat, fix, chore 등)을 그대로 사용한다.
- 대괄괄호 안에 **Prefix**를 사용해 해당 커밋의 성격을 표시한다.
- 한칸 띄어쓰기 이후 해당 커밋의 간략한 설명을 한글로 작성한다.

| 예시 | 설명 |
| --- | --- |
| **`[feat] 청첩장 미리보기 기능 추가`** | 새로운 기능을 추가한 경우 |
| **`[fix] 날짜 선택 오류 해결`** | 버그나 동작 문제를 수정한 경우 |
| **`[chore] ESLint 규칙 정리`** | 설정 변경, 빌드 작업 등 잡무 처리 |

---

## Branch Name

> 형식 ⇒ **`prefix/scope/type`**

- **Prefix**는 상단에 정의된 규칙(feat, fix, chore 등)을 그대로 사용한다.
- **Scope**는 기능 명세가 확정된 이후, 실제 기능 단위에 맞춰 지정한다.
- **Type**은 작업 성격에 따라 다음 기준으로 구분한다:
    - **base**: 해당 컴포넌트나 기능의 **초기 구조·뼈대**를 개발할 때 사용.
    - **typeA…**: 동일 컴포넌트의 다양한 변형(variation)이나 파생 작업을 진행할 때 사용하며 알파벳을 늘려가며 확장한다.

| 예시 | 설명 |
| --- | --- |
| **`feat/calendar/base`** | `기능추가 / 달력 컴포넌트 / 베이스` → 달력 컴포넌트의 베이스 개발 |
| **`feat/calendar/typeA`** | `기능추가 / 달력 컴포넌트 / A타입` → 달력 컴포넌트의 A 타입 개발 |
| **`fix/map/base`** | `버그픽스 / 지도 컴포넌트 / 베이스` → 지도 컴포넌트 베이스의 버그 수정 |
