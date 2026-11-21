import type { UploadFail } from './uploadAllSettled';

function getErrorStatus(err: unknown): number | null {
  if (err instanceof Error) {
    const updateMatch = err.message.match(/Drive update failed:\s*(\d{3})/);
    if (updateMatch?.[1]) return Number(updateMatch[1]);

    const uploadMatch = err.message.match(/Drive upload failed:\s*(\d{3})/);
    if (uploadMatch?.[1]) return Number(uploadMatch[1]);
  }

  const possibleError = err as {
    cause?: { error?: { code?: number | string } };
    status?: number | string;
    code?: number | string;
  };
  const code =
    possibleError?.cause?.error?.code ??
    possibleError?.status ??
    possibleError?.code;

  if (typeof code === 'number') return code;
  if (typeof code === 'string' && /^\d{3}$/.test(code)) return Number(code);
  return null;
}

export function shouldPrepareFallback(failures: UploadFail[]) {
  return failures.some(failure => {
    const status = getErrorStatus(failure.error);
    return status === 403 || status === 404;
  });
}
