export const GOOGLE_DRIVE_FILE_SCOPE =
  'https://www.googleapis.com/auth/drive.file';

export const GOOGLE_AUTH_SCOPE = `openid ${GOOGLE_DRIVE_FILE_SCOPE}`;

export function parseGrantedScopes(scope: unknown): Set<string> {
  if (typeof scope !== 'string') {
    return new Set();
  }

  return new Set(scope.split(/\s+/).filter(Boolean));
}

export function hasRequiredDriveScope(scope: unknown): boolean {
  return parseGrantedScopes(scope).has(GOOGLE_DRIVE_FILE_SCOPE);
}
