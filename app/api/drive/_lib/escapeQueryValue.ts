/**
 * Google Drive query 문자열용 최소 escape
 *
 * - 작은따옴표(') escape
 * - Drive files.list q 파라미터 전용
 *
 * 주의:
 * - 사용자 입력을 그대로 넣는 용도가 아님.
 * - name 검색 등에는 가급적 사용하지 말것.
 *   appProperties / parents 기반 쿼리를 우선할 것.
 *
 */
export function escapeDriveQueryValue(value: string): string {
  return value.replace(/'/g, "\\'");
}
