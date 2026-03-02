type DebouncedFunction<T extends unknown[]> = ((...args: T) => void) & {
  cancel: () => void;
};

export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      func(...args);
    }, delay);
  }) as DebouncedFunction<T>;

  debounced.cancel = () => {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}
