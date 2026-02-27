export const parseValue = (data: string, target: string, replace: string) => {
  const cleaned = data.replace(target, replace).trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};
