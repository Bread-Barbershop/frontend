# 슬롯 레거시 제거 체크리스트

## 호환 레이어 원칙
- [legacy.ts](./legacy.ts)는 레거시 JSON 필드 접근을 감싸는 유일한 호환 래퍼로 유지한다.
- 런타임 호출부가 모두 `object/frame` 헬퍼를 직접 사용하게 된 뒤에만 래퍼 export 제거를 검토한다.

## 아직 남아 있는 레거시 저장 필드
- `slotFrameWidth`
- `slotFrameHeight`
- `slotFrameLeft`
- `slotFrameTop`
- `slotFrameAngle`
- `slotZoomScale`
- `slotImageBaseScale`
- `slotImageOffsetX`
- `slotImageOffsetY`

## 제거 전에 다시 확인할 호출 지점
- [useFabric.ts](../hooks/useFabric.ts)의 커스텀 직렬화 키 목록
- [types.ts](./types.ts)의 레거시 필드 타입 별칭
- 여전히 레거시 필드명을 기대하는 템플릿 JSON reader/writer 전반

## 안전하게 제거해도 되는 조건
- 새로운 런타임 헬퍼가 슬롯 필드 읽기/쓰기를 모두 대체한다.
- 마이그레이션 전용 진입점을 제외하고는 어떤 기능도 `legacy.ts`를 import하지 않는다.
- 기존 템플릿 JSON이 모두 마이그레이션되었거나, 하위 호환이 보장된다.
- 제거 전후의 export/import 스냅샷이 동일하게 유지된다.
