export class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  /**
   * 측정을 종료하고 걸린 시간을 콘솔에 출력합니다.
   * @param additionalInfo 추가로 출력할 정보 (선택)
   * @returns 소요 시간 (ms)
   */
  public end(additionalInfo?: string) {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const info = additionalInfo ? ` (${additionalInfo})` : '';
    console.info(
      `⏱️ [Performance] ${this.label}${info}: ${duration.toFixed(2)}ms`
    );

    return duration;
  }
}

/**
 * 비동기 함수의 실행 시간을 측정하는 유틸리티 함수입니다.
 * @param label 측정 라벨
 * @param fn 실행할 비동기 함수
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const timer = new PerformanceTimer(label);
  try {
    return await fn();
  } finally {
    timer.end();
  }
}
