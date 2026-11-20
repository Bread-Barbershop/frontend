export function getDefaultChildTitle(name?: string | null): string {
  const childName = name?.trim().normalize('NFC');
  if (!childName) return '우리 아이의 첫 생일';

  const last = childName.charCodeAt(childName.length - 1);
  // 한글 완성형은 음절마다 종성 28칸이 있고, 첫 칸은 받침이 없다.
  const hasBatchim =
    last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return `${childName}${hasBatchim ? '이' : ''}의 첫 생일`;
}
