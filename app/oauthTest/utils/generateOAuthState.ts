import crypto from 'crypto';

/**
 * CSRF 공격 방지를 위한 OAuth state 파라미터 생성 함수입니다.
 * * @param bytes - 생성할 무작위 데이터의 바이트 길이 (기본값: 16)
 * @returns 16진수(hex) 문자열로 인코딩된 랜덤 state 값
 */
export function generateOAuthState(bytes: number = 16): string {
  // 보안상 안전한 난수를 생성하여 hex 문자열로 변환합니다.
  return crypto.randomBytes(bytes).toString('hex');
}
