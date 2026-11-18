import { isValidDateParts } from '@/shared/utils/dateValidation';

const structuredBirthdate =
  /^(?:birth[-_]?(?:date|day)|date[-_]?of[-_]?birth)$/iu;
const birthdateLabel = String.raw`(?:생\s*년\s*월\s*일|출생\s*일(?:자)?|태어난\s*(?:날짜|날)|\b(?:date\s+of\s+birth|birth\s*date|d\.?o\.?b)\b\.?)`;
const fullDate = String.raw`(?:\d{4}\s*[-./]\s*\d{1,2}\s*[-./]\s*\d{1,2}|\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일|\d{8})(?!\d)`;
const labeledDate = new RegExp(
  String.raw`((?:${birthdateLabel}(?:은|는|\s+is\b)?[\s:：=\-–—]*|생일\s*[:：=]\s*))(${fullDate})`,
  'giu'
);
const birthdatePrompt = new RegExp(
  String.raw`^\s*(?:\p{L}+의\s*)?(?:${birthdateLabel}|생일(?:\s*$|\s*[:：?]|[은이]\s+))`,
  'iu'
);
const dateInText = new RegExp(String.raw`(?<!\d)${fullDate}`, 'gu');
const birthVerb = /^\s*(?:에\s*)?(?:태어났|태어난|출생)/u;
const scheduleLabel =
  /(?:일정(?:이 끝나는 날)?|행사\s*(?:일시|일자|날짜|일)?|예식\s*(?:일시|일)?|생일\s*(?:파티|행사)|event date)(?:은|는|이|가)?[\s:：=\-–—]*$/iu;
const proseKey =
  /^(?:.*(?:title|description|message|caption|Html)|label|detail|text|body|contents?|question|answer|notice)$/iu;

function maskDate(_match: string, label: string, date: string) {
  return label + date.replace(/\d/g, '*');
}

function dateKey(date: string) {
  const digits = date.match(/\d+/gu) ?? [];
  const [year, month, day] =
    digits.length === 1
      ? [date.slice(0, 4), date.slice(4, 6), date.slice(6, 8)].map(Number)
      : digits.map(Number);
  return isValidDateParts({ year, month, day })
    ? `${year}-${month}-${day}`
    : undefined;
}

function maskBirthdatesInText(
  text: string,
  knownBirthdates: ReadonlySet<string>,
  isBirthdateAnswer: boolean
) {
  const masked = text.replace(labeledDate, maskDate);
  const candidates = [...masked.matchAll(dateInText)].flatMap(match => {
    const [date] = match;
    const offset = match.index;
    const key = dateKey(date);
    if (!key || scheduleLabel.test(text.slice(0, offset))) return [];
    return [
      {
        offset,
        explicit:
          knownBirthdates.has(key) ||
          birthVerb.test(text.slice(offset + date.length)),
      },
    ];
  });
  const toMask = candidates.filter(({ explicit }) => explicit);
  if (!toMask.length && isBirthdateAnswer && masked === text && candidates[0]) {
    toMask.push(candidates[0]);
  }
  if (!toMask.length) return masked;

  const offsets = new Set(toMask.map(({ offset }) => offset));
  return masked.replace(dateInText, (date: string, offset: number) =>
    offsets.has(offset) ? date.replace(/\d/gu, '*') : date
  );
}

// Match across inline formatting while preserving each run's length and style.
function redactTextRuns(
  runs: string[],
  knownBirthdates: ReadonlySet<string>,
  isBirthdateAnswer: boolean
) {
  const original = runs.join('');
  const masked = maskBirthdatesInText(
    original,
    knownBirthdates,
    isBirthdateAnswer
  );
  if (masked === original) return runs;
  let start = 0;
  return runs.map(run => {
    const result = masked.slice(start, start + run.length);
    start += run.length;
    return result;
  });
}

function redactHtml(
  html: string,
  knownBirthdates: ReadonlySet<string>,
  isBirthdateAnswer: boolean
) {
  const tokens = html.match(/<(?:[^"'<>]|"[^"]*"|'[^']*')*>|[^<]+|</gu) ?? [];
  const runs = tokens.map(token => {
    if (token.startsWith('<')) {
      return /^<(?:br\b|\/p>)/iu.test(token) ? '\n' : '';
    }
    return token.replace(/&nbsp;|&#160;/giu, spaces =>
      ' '.repeat(spaces.length)
    );
  });
  const masked = redactTextRuns(runs, knownBirthdates, isBirthdateAnswer);
  if (masked === runs) return html;

  return tokens
    .map((token, index) =>
      token.startsWith('<')
        ? token
        : token.replace(/\d/gu, (digit, offset: number) =>
            masked[index][offset] === '*' ? '*' : digit
          )
    )
    .join('');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isTextNode(value: unknown): value is { type: 'text'; text: string } {
  return (
    isRecord(value) && value.type === 'text' && typeof value.text === 'string'
  );
}

function isBirthdatePrompt(value: unknown) {
  return typeof value === 'string' && birthdatePrompt.test(value);
}

function collectBirthdates(value: unknown, birthdates: Set<string>) {
  if (Array.isArray(value)) {
    value.forEach(entry => collectBirthdates(entry, birthdates));
  } else if (isRecord(value)) {
    for (const [key, entry] of Object.entries(value)) {
      if (
        structuredBirthdate.test(key) &&
        (typeof entry === 'number' || typeof entry === 'string')
      ) {
        const date = String(entry).match(dateInText)?.[0];
        const normalized = date && dateKey(date);
        if (normalized) birthdates.add(normalized);
      } else {
        collectBirthdates(entry, birthdates);
      }
    }
  }
}

const noBirthdates = new Set<string>();

function redactBirthdateContent(
  value: unknown,
  knownBirthdates: ReadonlySet<string>,
  isBirthdateAnswer = false,
  allowKnownText = false
): unknown {
  if (typeof value === 'string') {
    return maskBirthdatesInText(
      value,
      allowKnownText ? knownBirthdates : noBirthdates,
      isBirthdateAnswer
    );
  }
  if (Array.isArray(value)) {
    if (value.some(isTextNode)) {
      const runs = value.map(node => (isTextNode(node) ? node.text : '\n'));
      const masked = redactTextRuns(runs, knownBirthdates, isBirthdateAnswer);
      return masked === runs
        ? value
        : value.map((node, index) =>
            isTextNode(node) && node.text !== masked[index]
              ? { ...node, text: masked[index] }
              : node
          );
    }
    const children = value.map((entry, index) =>
      redactBirthdateContent(
        entry,
        knownBirthdates,
        isBirthdateAnswer && index === 0,
        allowKnownText
      )
    );
    return children.some((entry, index) => entry !== value[index])
      ? children
      : value;
  }
  if (!isRecord(value)) return value;

  const entries = Object.entries(value).map(([key, entry]) => {
    if (
      structuredBirthdate.test(key) &&
      (typeof entry === 'number' || typeof entry === 'string')
    ) {
      return [key, String(entry).replace(/\p{N}/gu, '*')] as const;
    }
    const answer =
      (key === 'answer' && isBirthdatePrompt(value.question)) ||
      (key === 'content' && isBirthdatePrompt(value.notice)) ||
      (isBirthdateAnswer && /^(?:messageJson|messageHtml|content)$/u.test(key));
    const redacted =
      typeof entry === 'string' && /Html$/u.test(key)
        ? redactHtml(entry, knownBirthdates, answer)
        : redactBirthdateContent(
            entry,
            knownBirthdates,
            answer,
            proseKey.test(key)
          );
    return [key, redacted] as const;
  });
  return entries.some(([key, entry]) => entry !== value[key])
    ? Object.fromEntries(entries)
    : value;
}

export function createBirthdateRedactor(
  blockProps: unknown[],
  scheduleDates: string[]
) {
  const knownBirthdates = new Set<string>();
  collectBirthdates(blockProps, knownBirthdates);
  for (const date of scheduleDates) {
    const key = dateKey(date);
    if (key) knownBirthdates.delete(key);
  }
  return (props: unknown) => redactBirthdateContent(props, knownBirthdates);
}
