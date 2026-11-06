import { componentCls } from './componentInfo';
import { filterComponentCategories } from './componentSearch';

describe('블록 검색 별칭과 복합 검색', () => {
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
