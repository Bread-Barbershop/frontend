export const parseValue = (data: string, target: string, replace: string) => {
  const cleaned = data.replace(target, replace).trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

export const sanitizeEnglishTitle = (value: string) =>
  value.replace(/[^A-Za-z ]/g, '');

export const sanitizeEnglishTitleInput = (target: HTMLInputElement) => {
  const sanitizedValue = sanitizeEnglishTitle(target.value);

  if (target.value !== sanitizedValue) {
    target.value = sanitizedValue;
  }

  return sanitizedValue;
};
