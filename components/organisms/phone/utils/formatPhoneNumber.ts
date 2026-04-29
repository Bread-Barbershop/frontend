/** 전화번호를 한국 번호 형식의 하이픈 표기로 변환한다. */
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

/** 전화번호 입력값에서 숫자만 남기고 최대 11자리로 제한한다. */
export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 11);
}
