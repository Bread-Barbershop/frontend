const SECRET_FIELD =
  /^(authorization|cookie|set-cookie|access[_-]?token|refresh[_-]?token|id[_-]?token|upload[_-]?(url|uri)|auth[_-]?encryption[_-]?key)$/i;
const UPLOAD_URI =
  /https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files[^\s"'<>)]*/gi;

/** Resumable URIs grant upload access and must not reach error breadcrumbs or spans. */
export function redactSensitiveTelemetry<T>(input: T): T {
  const seen = new WeakMap<object, unknown>();
  const visit = (value: unknown, depth: number): unknown => {
    if (typeof value === 'string')
      return value.replace(
        UPLOAD_URI,
        url => `${url.split('?')[0]}?[redacted]`
      );
    if (!value || typeof value !== 'object') return value;
    if (depth > 20) return '[redacted-depth]';
    if (seen.has(value)) return '[redacted-cycle]';
    const output: unknown[] | Record<string, unknown> = Array.isArray(value)
      ? []
      : {};
    seen.set(value, output);
    for (const [key, item] of Object.entries(value)) {
      (output as Record<string, unknown>)[key] = SECRET_FIELD.test(key)
        ? '[redacted]'
        : visit(item, depth + 1);
    }
    return output;
  };
  return visit(input, 0) as T;
}
