# Frontend — AI Agent 가이드 (SSOT)

이 문서는 `frontend` 프로젝트에서 작업하는 모든 AI 코딩 에이전트(Claude Code / Codex / Gemini CLI / Antigravity)의 루트 지침입니다.

---

## 🚀 CI 검증 및 작업 루프 원칙 (핵심)

1. **무거운 CI 검증은 GitHub Actions에 위임**
   - 로컬에서 전체 빌드·전체 테스트·전체 린트 등 무거운 검증 명령을 매번 임의로 실행하지 않습니다.
   - 로컬에서는 수정한 파일에 대한 최소한의 검증만 수행하고, 검증 게이트(Gate)는 **GitHub Actions CI(`Frontend Gate`)**에 전적으로 맡깁니다.

2. **CI 관측 기반의 점진적 수정 루프 (Observe & Iterate)**
   - 코드를 푸시하거나 PR을 생성한 후, **AI 에이전트는 터미널 CLI(`gh pr checks`, `gh run view`, `gh run watch`)로 CI 진행 상황과 실패 로그를 직접 관측**합니다.
   - CI에서 에러가 발생하면 로그를 분석하여 원인을 진단하고, 필요한 수정을 거쳐 재푸시한 뒤 최종 결과를 다시 관측하는 루프를 반복합니다.

3. **브랜치 및 머지 정책**
   - 개발 흐름: `작업 브랜치(feat/*, fix/*, chore/*)` → `dev` → `main(배포)`.
   - `main` 브랜치로는 직접 PR을 올릴 수 없으며, 오직 `dev` 브랜치를 통해서만 머지됩니다 (CI 단에서 자동 차단).
   - 머지는 GitHub Merge Queue를 통해 순차적·안정적으로 자동 병합됩니다.

---

## 🛠️ 테스트 및 코드 컨벤션

- 테스트 가이드 상세: `.agents/rules/test-code-guide.md`
- Next.js 타입 검사는 별도 `tsc --noEmit` 대신 `npm run build` 단계에서 Next.js 내부 컴파일러가 전체 타입 게이트 역할을 수행합니다.
- Node/Jest 환경에서 Tiptap HTML 변환 시 `tiptapJsonToHtmlUniversal` 유틸리티를 사용합니다.
