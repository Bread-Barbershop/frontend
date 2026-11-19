import { DEFAULT_TITLE } from '@/shared/utils/shareUrlDefaults';

import { resolveDashboardTitle } from './resolveDashboardTitle';

const generatedName = '초대장 - 2026년 11월 19일 10시 30분';

describe('마이페이지 초대장 제목', () => {
  it('직접 붙인 폴더 이름이 있으면 생성 시각을 빼고 본문 조회를 생략한다', async () => {
    const load = jest.fn();
    await expect(
      resolveDashboardTitle(
        '가족 모임 - 2026년 11월 19일 10시 30분',
        '공유 제목',
        load
      )
    ).resolves.toBe('가족 모임');
    expect(load).not.toHaveBeenCalled();
  });

  it('기본 공유 문구는 건너뛰고 링크에 입력한 제목을 사용한다', async () => {
    await expect(
      resolveDashboardTitle(generatedName, DEFAULT_TITLE, async () => ({
        shareUrl: { urlTitle: '  개발자 모임  ' },
      }))
    ).resolves.toBe('개발자 모임');
  });

  it('복사본도 신부 먼저 표시 설정과 복사본 표시를 유지한다', async () => {
    await expect(
      resolveDashboardTitle('초대장 (복사본)', undefined, async () => ({
        blocks: [
          {
            component: 'coupleIntroduction',
            props: { brideFirst: true, groom: '지훈', bride: '민서' },
          },
        ],
      }))
    ).resolves.toBe('민서·지훈 결혼식 (복사본)');
  });

  it('아기 소개에 입력된 이름으로 돌잔치를 구분한다', async () => {
    await expect(
      resolveDashboardTitle(generatedName, '', async () => ({
        blocks: [
          {
            type: 'firstBirthday',
            component: 'myChild',
            props: { name: '하은' },
          },
        ],
      }))
    ).resolves.toBe('하은 돌잔치');
  });

  it('본문을 읽을 수 없으면 생성 시각이 포함된 원래 이름을 표시한다', async () => {
    await expect(
      resolveDashboardTitle(generatedName, DEFAULT_TITLE, async () => null)
    ).resolves.toBe(generatedName);
  });
});
