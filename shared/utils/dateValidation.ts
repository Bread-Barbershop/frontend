export type StrictDateParts = {
  year: number;
  month: number;
  day: number;
};

export type StrictDateTimeParts = StrictDateParts & {
  hour: number;
  minute: number;
};

export type DateSeparator = '-' | '.';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function isValidDateParts({ year, month, day }: StrictDateParts) {
  if (!Number.isInteger(year) || year < 1 || year > 9999) return false;
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1) return false;

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

  return day <= daysInMonth;
}

export function parseStrictDate(
  value: string,
  separator: DateSeparator = '-'
): StrictDateParts | null {
  const pattern =
    separator === '-'
      ? /^(\d{4})-(\d{2})-(\d{2})$/
      : /^(\d{4})\.(\d{2})\.(\d{2})$/;
  const match = pattern.exec(value);
  if (!match) return null;

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  return isValidDateParts(parts) ? parts : null;
}

export function isValidDateTimeLocal(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  return (
    isValidDateParts({ year, month, day }) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  );
}

export function parseStrictDateTimeLocal(value: string): StrictDateTimeParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const parts = { year, month, day, hour, minute };
  return isValidDateTimeLocal(value) ? parts : null;
}

export function getTodayKstDateString(now: number = Date.now()) {
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(now));
  const values = Object.fromEntries(dateParts.map(part => [part.type, part.value]));

  return `${values.year.padStart(4, '0')}-${values.month}-${values.day}`;
}

export function parseSeoulDateTimeToTimestamp(value: string): number | null {
  const parts = parseStrictDateTimeLocal(value);
  if (!parts) return null;

  // Avoid Date.UTC's special handling of years 0–99 and keep the input as
  // Korean wall-clock time without interpreting it in the machine's timezone.
  const utcDate = new Date(0);
  utcDate.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  utcDate.setUTCHours(parts.hour, parts.minute, 0, 0);
  return utcDate.getTime() - KST_OFFSET_MS;
}
