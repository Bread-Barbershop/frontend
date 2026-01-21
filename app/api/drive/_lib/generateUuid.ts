/**
 * 초대장 식별용 짧은 ID 생성
 *
 * - Base62 (a-zA-Z0-9)
 *
 */
const BASE62 =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateUuid(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let id = '';

  for (let i = 0; i < length; i++) {
    id += BASE62[bytes[i] % BASE62.length];
  }

  return id;
}
