/**
 * 컬러 컨버터에서 사용하는 입력 모드입니다.
 *
 * `hex`는 단일 HEX 문자열 입력을, `rgb`는 R/G/B 세 채널 입력을 의미합니다.
 * 루트 컬러피커는 이 값을 기준으로 컨버터 섹션의 렌더링 방식을 분기합니다.
 */
export type InputMode = 'hex' | 'rgb';

/**
 * 컬러피커 전체에서 공통으로 사용하는 HSVA 색상 모델입니다.
 *
 * 외부 라이브러리의 색상 계산 결과도 이 형태로 맞춰서 전달하고,
 * 각 세부 섹션은 필요한 채널만 수정한 뒤 상위로 부분 업데이트를 올립니다.
 */
export type PickerHsva = {
  h: number;
  s: number;
  v: number;
  a: number;
};

/**
 * 외부 컴포넌트가 컬러피커 값을 주입할 때 사용할 수 있는 입력 타입입니다.
 *
 * 간단한 사용처에서는 HEX 문자열만 넘겨도 되고,
 * 보다 정밀한 제어가 필요한 경우 HSVA 객체를 직접 넘길 수 있습니다.
 */
export type ColorPickerValue = PickerHsva | string;

/**
 * 컬러피커 변경 이벤트를 부모 컴포넌트로 전달할 때 사용하는 payload입니다.
 *
 * 부모는 `hex`를 바로 저장하거나 미리보기 색상에 사용할 수 있고,
 * `hsva`는 다른 색상 계산 로직이나 후속 변환에 재사용할 수 있습니다.
 */
export type ColorPickerChange = {
  hsva: PickerHsva;
  hex: string;
};
