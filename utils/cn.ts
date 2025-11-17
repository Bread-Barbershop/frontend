import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * clsx와 tailwind-merge를 결합한 유틸 함수
 * @param classNames 병합할 클래스 명들
 * @returns 병합된 클래스 명
 */

export const cn = (...classNames: ClassValue[]): string => {
  return twMerge(clsx(classNames));
};
