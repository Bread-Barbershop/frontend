import { isJsonRecord } from '@/app/api/drive/_lib/cloneInvitationData';
import { DEFAULT_TITLE } from '@/shared/utils/shareUrlDefaults';

function customShareTitle(value: unknown) {
  const title = typeof value === 'string' ? value.trim() : '';
  return title === DEFAULT_TITLE ? '' : title;
}

function titleFromSavedInvitation(data: unknown) {
  if (!isJsonRecord(data)) return '';
  if (isJsonRecord(data.shareUrl)) {
    const title =
      customShareTitle(data.shareUrl.urlTitle) ||
      customShareTitle(data.shareUrl.title);
    if (title) return title;
  }

  if (!Array.isArray(data.blocks)) return '';
  for (const block of data.blocks) {
    if (!isJsonRecord(block) || !isJsonRecord(block.props)) continue;
    const { groom, bride, brideFirst, name } = block.props;
    if (block.component === 'coupleIntroduction') {
      const names = (brideFirst === true ? [bride, groom] : [groom, bride])
        .filter((value): value is string => typeof value === 'string')
        .map(value => value.trim())
        .filter(Boolean);
      if (names.length) return `${names.join('·')} 결혼식`;
    }
    if (
      block.component === 'myChild' &&
      typeof name === 'string' &&
      name.trim()
    ) {
      if (block.type === 'firstBirthday') return `${name.trim()} 돌잔치`;
      if (block.type === 'birthday') return `${name.trim()} 생일`;
    }
  }
  return '';
}

export async function resolveDashboardTitle(
  folderName: string,
  shareTitle: string | undefined,
  loadSavedData: () => Promise<unknown>
): Promise<string> {
  const baseName = folderName
    .replace(/ - \d{4}년 \d{2}월 \d{2}일 \d{2}시 \d{2}분$/, '')
    .trim();
  const generatedName = /^초대장((?: \(복사본\))*)$/.exec(baseName);
  if (baseName && !generatedName) return baseName;

  const title =
    customShareTitle(shareTitle) ||
    titleFromSavedInvitation(await loadSavedData());
  return title
    ? title + (generatedName?.[1] ?? '')
    : folderName.trim() || '제목 없는 초대장';
}
