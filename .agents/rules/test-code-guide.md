---
trigger: always_on
---

Test Code 작성 규칙

- 작업 후 설명은 무조건 한국어로 응답한다.

테스트 전략 개요
Atomic Design 컴포넌트 구조에 기반하여 테스트 범위를 계층별로 수립한다.

1. 단위 테스트 (Unit Test)
   1-1. UI 렌더링 테스트 — React Testing Library
   대상: Atoms · Molecules 컴포넌트
   규칙:

- 컴포넌트가 정상적으로 렌더링되는지 확인한다.
- props에 따른 조건부 렌더링을 검증한다.
- 사용자 이벤트(click, input, change 등)에 따른 UI 변화를 검증한다.
- 접근성(aria 속성, role 등)을 함께 검증한다.
- 구현 세부사항(state, 내부 메서드)이 아닌 사용자 관점의 동작을 테스트한다.

파일 네이밍: [ComponentName].test.tsx

1-2. 핵심 로직 테스트 — Jest
대상: 커스텀 훅(Custom Hooks), 유틸 함수(Utils), Google Drive API 연동 로직
규칙:

- 순수 함수는 입력 → 출력 매핑으로 검증한다.
- 커스텀 훅은 @testing-library/react-hooks의 renderHook을 사용한다.
- 외부 API(Google Drive 등)는 반드시 Mock 처리하여 테스트한다.
- 에러 케이스와 엣지 케이스를 반드시 포함한다.

파일 네이밍:

유틸 함수: [utilName].test.ts
커스텀 훅: use[HookName].test.ts
API 로직: [apiModule].test.ts

2. 통합 테스트 (Integration Test)
   도구: React Testing Library + Jest
   대상: Organisms 단위 — 여러 Atoms · Molecules가 조합된 컴포넌트
   규칙:

자식 컴포넌트 간의 상호작용과 데이터 흐름을 검증한다.
필요한 Context Provider, Router 등 실제 환경과 유사한 래퍼를 구성한다.
외부 API 호출은 Mock 처리하되, 컴포넌트 간 연결은 실제 동작으로 검증한다.
사용자 시나리오 기반으로 테스트를 작성한다.

파일 네이밍: [OrganismName].integration.test.tsx

3. E2E 테스트

⚠️ E2E 테스트 도구는 미정 상태이며, 도구 선정 후 본 섹션을 업데이트한다.

대상 플로우: #시나리오검증 포인트1Google 로그인OAuth 인증 → 로그인 성공 → 메인 화면 진입2초대장 제작템플릿 선택 → 내용 입력 → 미리보기 확인3업로드Google Drive 업로드 → 성공 응답 확인4URL 발행공유 URL 생성 → 클립보드 복사 → URL 접근 시 초대장 렌더링5전체 플로우로그인 → 제작 → 업로드 → URL 발행 E2E 통과

4. 공통 규칙
   테스트 작성 원칙

AAA 패턴을 따른다: Arrange(준비) → Act(실행) → Assert(검증)
describe 블록으로 테스트 대상을 그룹화하고, it 블록에는 한국어로 기대 동작을 명시한다.
하나의 it 블록에는 하나의 검증 목적만 둔다.
테스트 간 의존성을 만들지 않는다. 각 테스트는 독립적으로 실행 가능해야 한다.

Mock 규칙

외부 API(Google Drive, OAuth 등)는 항상 Mock 처리한다.
Mock 데이터는 **mocks**/ 또는 fixtures/ 디렉토리에 별도 관리한다.
Mock은 최소 범위로 적용하고, 과도한 Mock으로 인해 테스트 신뢰도가 떨어지지 않도록 한다.

커버리지 기준

단위 테스트: Atoms · Molecules 컴포넌트 및 유틸/훅 주요 분기 커버리지 확보
통합 테스트: Organisms 단위 핵심 사용자 시나리오 커버리지 확보
E2E 테스트: 주요 비즈니스 플로우 Happy Path 필수, 주요 에러 시나리오 권장
