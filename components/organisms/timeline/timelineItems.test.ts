import { getTimelinePreset, normalizeTimelineItems } from './timelineItems';

describe('타임라인 행사별 프리셋과 데이터 정규화', () => {
  it('결혼식/돌잔치/세미나 타입별 일정 예시가 서로 다르다', () => {
    const wedding = getTimelinePreset('wedding');
    const baby = getTimelinePreset('firstBirthday');
    const seminar = getTimelinePreset('seminar');
    expect(wedding.some(item => item.title.includes('결혼식'))).toBe(true);
    expect(baby.some(item => item.title.includes('돌잡이'))).toBe(true);
    expect(seminar.some(item => item.title.includes('세션'))).toBe(true);
  });
  it('잘못된 항목을 제외하고 설명은 최대 200자로 유지한다', () => {
    expect(normalizeTimelineItems([
      null, { id: 'a', time: '10:00', title: '안내', description: 'x'.repeat(400) },
    ])).toEqual([{ id: 'a', time: '10:00', title: '안내', description: 'x'.repeat(200) }]);
  });
  it('오래된 저장 데이터도 기본값으로 보정한다', () => {
    expect(normalizeTimelineItems([{ id: 'a', title: '기본' }])[0]).toEqual({
      id: 'a', title: '기본', time: '', description: '',
    });
  });
});
