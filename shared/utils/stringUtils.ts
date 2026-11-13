export const parseValue = (data: string, target: string, replace: string) => {
  const cleaned = data.replace(target, replace).trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

export const sanitizeEnglishTitle = (value: string) =>
  value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]|\p{Script=Hangul}/gu, '');

export const sanitizeEnglishTitleInput = (target: HTMLInputElement) => {
  const sanitizedValue = sanitizeEnglishTitle(target.value);

  if (target.value !== sanitizedValue) {
    target.value = sanitizedValue;
  }

  return sanitizedValue;
};
