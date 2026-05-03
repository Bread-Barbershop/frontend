/**
 * 전화번호 문자열을 화면 표시용 하이픈 형식으로 변환합니다.
 *
 * 이 함수는 입력값에서 숫자만 추출한 뒤 한국 전화번호에서 흔히 쓰는 구분자 규칙을 적용합니다.
 * 서울 지역번호(`02`)는 `02-000-0000` 또는 `02-0000-0000` 형태로 처리하고,
 * 그 외 번호는 `000-000-0000` 또는 `000-0000-0000` 형태로 처리합니다.
 *
 * 원본 입력값에 포함된 공백, 하이픈, 괄호 같은 숫자가 아닌 문자는 모두 무시합니다.
 * 반환값은 UI 표시용 값이므로, 상태 저장에는 {@link normalizePhoneNumber}로 정규화한 값을 쓰는 것을 권장합니다.
 *
 * @param value 포맷할 전화번호 입력값
 * @returns 하이픈 구분자가 포함된 전화번호 문자열
 *
 * @example
 * formatPhoneNumber('0212345678') // '02-1234-5678'
 * formatPhoneNumber('01012345678') // '010-1234-5678'
 */
export function formatPhoneNumber(value: string) {
  const numbers = value.replace(/\D/g, '');

  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    }
    if (numbers.length <= 9) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    }

    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }
  if (numbers.length <= 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * 전화번호 입력값을 저장용 숫자 문자열로 정규화합니다.
 *
 * 사용자가 입력한 값에서 숫자가 아닌 문자를 제거하고, 국내 휴대폰/지역번호 입력에 맞춰
 * 최대 11자리까지만 남깁니다. 예를 들어 `010-1234-5678`은 `01012345678`로 저장됩니다.
 *
 * 이 함수의 반환값은 데이터 저장과 `tel:` 링크 생성에 적합합니다.
 * 입력창이나 미리보기처럼 사용자에게 보여주는 영역에서는 {@link formatPhoneNumber}를 사용해
 * 하이픈이 포함된 형태로 표시할 수 있습니다.
 *
 * @param value 정규화할 전화번호 입력값
 * @returns 숫자만 포함된 최대 11자리 전화번호 문자열
 *
 * @example
 * normalizePhoneNumber('010-1234-5678') // '01012345678'
 * normalizePhoneNumber('(02) 1234-5678') // '0212345678'
 */
export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 11);
}
