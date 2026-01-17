import crypto from 'crypto';

/**
 * Buffer를 PKCE에서 요구하는 base64url(no padding) 형식으로 변환
 * - '+' → '-'
 * - '/' → '_'
 * - '=' 제거
 * 이렇게 해야 url 파라미터 형식과 충돌나지 않음.
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/**
 * PKCE code_verifier 생성
 * - 로그인 시작 시 생성되는 비밀 문자열
 * - 토큰 교환 단계에서만 사용됨
 */
export function generateCodeVerifier(bytes: number = 32): string {
  return base64UrlEncode(crypto.randomBytes(bytes));
}

/**
 * PKCE code_challenge 생성 (S256)
 * - code_verifier를 SHA-256 해시 후 base64url 인코딩
 * - 로그인 요청 시 구글에 전달
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
}
