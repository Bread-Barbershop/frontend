'use client';

import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';

import {
  getTodayKstDateString,
  type DateSeparator,
  isValidDateParts,
} from '@/shared/utils/dateValidation';

type ValidationResult =
  | { kind: 'empty' }
  | { kind: 'partial' }
  | { kind: 'invalid'; reason: 'format' | 'date' | 'past' }
  | { kind: 'valid'; formatted: string };

interface Options {
  value?: string | null;
  separator?: DateSeparator;
  allowPast?: boolean;
  onCommit: (value: string) => void;
  warning: (message: string) => void;
}

const DEFAULT_MESSAGES = {
  date: '올바른 날짜를 입력해 주세요.',
  incomplete: '날짜를 모두 입력해 주세요.',
  past: '이전 날짜는 입력할 수 없습니다.',
};

function formatPartialDate(digits: string, separator: DateSeparator) {
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}${separator}${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}${separator}${digits.slice(4, 6)}${separator}${digits.slice(6)}`;
}

function getDraftDigits(
  value: string,
  allowCompactMonthDayTail = false
): string | null {
  if (!/^[\d./-]+$/.test(value)) return null;
  if (!/[./-]/.test(value)) return value.length <= 8 ? value : null;

  const separators = value.match(/[./-]/g) ?? [];
  if (separators.some(separator => separator !== separators[0])) return null;

  const parts = value.split(/[./-]/);
  if (parts.length > 3 || parts[0].length !== 4) return null;
  if (
    parts.length === 2 &&
    allowCompactMonthDayTail &&
    parts[1].length >= 3 &&
    parts[1].length <= 4
  ) {
    return parts.join('');
  }
  if (parts[1].length > 2) return null;
  if (parts.length === 3 && (parts[1].length !== 2 || parts[2].length > 2)) {
    return null;
  }

  return parts.join('');
}

function validateDraft(
  value: string,
  separator: DateSeparator,
  allowPast: boolean
): ValidationResult {
  if (!value) return { kind: 'empty' };
  const digits = getDraftDigits(value);
  if (!digits?.length || digits.length > 8) return { kind: 'invalid', reason: 'format' };
  if (digits.length < 8) return { kind: 'partial' };

  const parts = {
    year: Number(digits.slice(0, 4)),
    month: Number(digits.slice(4, 6)),
    day: Number(digits.slice(6, 8)),
  };
  if (!isValidDateParts(parts)) return { kind: 'invalid', reason: 'date' };

  const isoDate = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  if (!allowPast && isoDate < getTodayKstDateString()) {
    return { kind: 'invalid', reason: 'past' };
  }

  return {
    kind: 'valid',
    formatted: formatPartialDate(digits, separator),
  };
}

function getWarningMessage(result: ValidationResult) {
  if (result.kind === 'partial') return DEFAULT_MESSAGES.incomplete;
  if (result.kind === 'invalid' && result.reason === 'past') {
    return DEFAULT_MESSAGES.past;
  }
  return DEFAULT_MESSAGES.date;
}

export function useValidatedDateDraft({
  value,
  separator = '-',
  allowPast = true,
  onCommit,
  warning,
}: Options) {
  const committedValue = value ?? '';
  const [draftState, setDraftState] = useState(() => ({
    sourceValue: committedValue,
    draft: committedValue,
    committed: committedValue,
    warningActive: false,
  }));
  const currentState = useMemo(
    () =>
      draftState.sourceValue === committedValue
        ? draftState
        : {
            sourceValue: committedValue,
            draft: committedValue,
            committed: committedValue,
            warningActive: false,
          },
    [committedValue, draftState]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.currentTarget.value;
      if (inputValue === '') {
        setDraftState({
          sourceValue: committedValue,
          draft: '',
          committed: '',
          warningActive: false,
        });
        onCommit('');
        return;
      }

      const isTypingDigitAtEnd =
        inputValue.length === currentState.draft.length + 1 &&
        inputValue.startsWith(currentState.draft) &&
        /^\d$/.test(inputValue.slice(-1));
      const digits = getDraftDigits(inputValue, isTypingDigitAtEnd);
      const nextDraft =
        digits && digits.length <= 8
          ? `${formatPartialDate(digits, separator)}${/[./-]$/.test(inputValue) && (digits.length === 4 || digits.length === 6) ? separator : ''}`
          : inputValue;

      const result = validateDraft(nextDraft, separator, allowPast);
      if (result.kind === 'valid') {
        setDraftState({
          sourceValue: committedValue,
          draft: result.formatted,
          committed: result.formatted,
          warningActive: false,
        });
        onCommit(result.formatted);
      } else if (result.kind === 'partial') {
        setDraftState({
          ...currentState,
          draft: nextDraft,
          warningActive: false,
        });
      } else if (result.kind === 'invalid') {
        if (!currentState.warningActive) warning(getWarningMessage(result));
        setDraftState({
          ...currentState,
          draft: nextDraft,
          warningActive: true,
        });
      }
    },
    [allowPast, committedValue, currentState, onCommit, separator, warning]
  );

  const handleBlur = useCallback(() => {
    const result = validateDraft(currentState.draft, separator, allowPast);
    if (result.kind === 'partial' || result.kind === 'invalid') {
      if (!currentState.warningActive) warning(getWarningMessage(result));
      setDraftState({
        sourceValue: committedValue,
        draft: currentState.committed,
        committed: currentState.committed,
        warningActive: false,
      });
    }
  }, [allowPast, committedValue, currentState, separator, warning]);

  return { draft: currentState.draft, handleChange, handleBlur };
}
