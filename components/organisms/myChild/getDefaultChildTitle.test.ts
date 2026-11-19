import { getDefaultChildTitle } from './getDefaultChildTitle';

describe('아기 소개 기본 제목', () => {
  it.each([
    ['하은', '하은이의 첫 생일'],
    ['서아', '서아의 첫 생일'],
    ['하은이', '하은이의 첫 생일'],
    ['  민준  ', '민준이의 첫 생일'],
    ['하은'.normalize('NFD'), '하은이의 첫 생일'],
    ['Noah', 'Noah의 첫 생일'],
    ['', '우리 아이의 첫 생일'],
    ['  ', '우리 아이의 첫 생일'],
    [undefined, '우리 아이의 첫 생일'],
  ])('이름 %p에 맞춰 %s을 표시한다', (name, title) => {
    expect(getDefaultChildTitle(name)).toBe(title);
  });
});
