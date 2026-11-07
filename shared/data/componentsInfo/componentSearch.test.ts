import { componentCls } from './componentInfo';
import type { SampleDataType } from './componentInfo';
import { BLOCK_SEARCH_ALIASES } from './blockSearchAliases';
import { filterComponentCategories } from './componentSearch';

describe('블록 검색 별칭과 복합 검색', () => {
  const expectedBlockTypes = [
    'greeting',
    'coupleIntroduction',
    'myFamilyWedding',
    'myFamily',
    'myChild',
    'calendar',
    'place',
    'gallery',
    'picture',
    'phone',
    'bgm',
    'account',
    'interview',
    'notice',
    'video',
    'closingComment',
    'organizerInformation',
    'sponsorshipInfomation',
    'speakerInformation',
    'wreath',
    'rsvp',
    'transportation',
    'countdown',
    'timeline',
    'dressCode',
    'divider',
    'spacer',
  ];
  const futureAliases: Record<string, readonly string[]> = {
    wreath: [
      '화환',
      '꽃',
      '화환보내기',
      '꽃배달',
      '축하화환',
      'wreath',
      'flower',
    ],
    rsvp: [
      '참석',
      '참석여부',
      '참석 여부 RSVP',
      'rsvp',
      '식사여부',
      '하객참석',
      '설문',
      'attendance',
    ],
    transportation: [
      '상세 교통 / 주차',
      '주차',
      '주차장',
      '셔틀',
      '셔틀버스',
      '지하철',
      '지하철역',
      '버스',
      '대중교통',
      'parking',
      'transit',
    ],
    countdown: [
      'D-Day 카운트다운',
      'D-Day 카운트 다운',
      '디데이',
      'dday',
      'd-day',
      '카운트다운',
      '남은시간',
      '타이머',
      'countdown',
      'timer',
    ],
    timeline: [
      '식순',
      '순서',
      '타임라인',
      '순서지',
      '프로그램',
      '일정표',
      '시간표',
      'timeline',
      'program',
    ],
    dressCode: [
      '드레스코드 & 매너',
      '드레스코드',
      '복장',
      '옷',
      '색상',
      '컬러',
      '매너',
      '에티켓',
      '화환사양',
      'dresscode',
    ],
    divider: [
      '선',
      '구분선',
      '세로선',
      '라인',
      '막대',
      '줄',
      '바',
      'divider',
      'line',
      'bar',
    ],
    spacer: [
      '간격',
      '공백',
      '빈칸',
      '띄우기',
      '거리',
      '패딩',
      '마진',
      'space',
      'spacer',
      'padding',
      'margin',
    ],
  };

  it('기존 블록과 향후 추가 블록의 별칭 사전을 빠짐없이 유지한다', () => {
    expect(Object.keys(BLOCK_SEARCH_ALIASES).sort()).toEqual(
      expectedBlockTypes.sort()
    );
    for (const [component, aliases] of Object.entries(futureAliases)) {
      expect(BLOCK_SEARCH_ALIASES[component]).toEqual(aliases);
    }
  });

  it('미래 블록 메타데이터도 각 별칭으로 검색된다', () => {
    const futureCategory: SampleDataType = {
      english: 'wedding',
      korea: '결혼식',
      list: Object.entries(futureAliases).flatMap(([component, aliases]) =>
        aliases.map(alias => ({
          contents: component,
          component: 'picture',
          isType: false,
          aliases: [alias],
        }))
      ),
    };

    for (const [component, aliases] of Object.entries(futureAliases)) {
      for (const alias of aliases) {
        const results = filterComponentCategories([futureCategory], alias);
        expect(results[0]?.list.some(item => item.contents === component)).toBe(
          true
        );
      }
    }
  });

  const findComponents = (query: string) =>
    filterComponentCategories(componentCls, query).flatMap(category =>
      category.list.map(item => ({ category: category.english, type: item.component }))
    );

  it('검색어가 비어 있으면 기존 카테고리를 그대로 유지한다', () => {
    expect(filterComponentCategories(componentCls, '  ')).toBe(componentCls);
  });

  it('사진·지도·축의금 등 별칭으로 기존 블록을 검색한다', () => {
    expect(findComponents('이미지').some(item => item.type === 'picture')).toBe(true);
    expect(findComponents('지도').some(item => item.type === 'place')).toBe(true);
    expect(findComponents('축의금').some(item => item.type === 'account')).toBe(true);
    expect(findComponents('BGM').some(item => item.type === 'bgm')).toBe(true);
  });

  it('이전 블록 이름으로도 변경된 블록을 검색한다', () => {
    expect(findComponents('상세 교통 / 주차').some(item => item.type === 'transportation')).toBe(true);
    expect(findComponents('참석 여부 RSVP').some(item => item.type === 'rsvp')).toBe(true);
    expect(findComponents('드레스코드 & 매너').some(item => item.type === 'dressCode')).toBe(true);
    expect(findComponents('D-Day 카운트다운').some(item => item.type === 'countdown')).toBe(true);
  });

  it('여러 검색어는 카테고리와 별칭을 함께 사용해 모두 만족해야 한다', () => {
    const results = findComponents('결혼식 지도');
    expect(results).toEqual([{ category: 'wedding', type: 'place' }]);
    expect(findComponents('결혼식  사진첩').some(item => item.type === 'gallery')).toBe(true);
  });

  it('기존 블록 이름 부분 검색과 카테고리 전체 검색도 유지한다', () => {
    expect(findComponents('신랑신부').some(item => item.type === 'coupleIntroduction')).toBe(true);
    const weddings = findComponents('결혼식');
    expect(weddings.length).toBe(componentCls[0].list.length);
    expect(weddings.every(item => item.category === 'wedding')).toBe(true);
  });

  it('존재하지 않는 검색어는 결과를 반환하지 않는다', () => {
    expect(findComponents('존재하지않는블록 987654321')).toEqual([]);
  });
});
