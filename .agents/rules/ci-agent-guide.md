---
trigger: always_on
---

# CI 검증 및 관측 작업 원칙

1. **CI 검증은 GitHub Actions에 위임**
   - 로컬에서 전체 빌드·전체 테스트 등 무거운 명령을 매번 실행하지 않습니다.
   - 전체 검증 게이트는 GitHub Actions(`Frontend Gate`)에 위임합니다.

2. **CI 관측 및 점진적 수정 루프**
   - 푸시 후 `gh pr checks` 또는 `gh run view`로 CI 실행 상태를 관측합니다.
   - 실패 시 로그를 파악하여 코드를 수정하고 재푸시하여 최종 통과(초록불)를 확인합니다.
