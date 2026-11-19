import { getClosingCommentOptions } from './closingCommentOptions';

describe('돌잔치 마무리 문구 예시', () => {
  it.each([
    ['하은', '하은이가 맞이한'],
    [' 하은이 ', '하은이가 맞이한'],
    ['하은'.normalize('NFD'), '하은이가 맞이한'],
    ['서아', '서아가 맞이한'],
    ['로이', '로이가 맞이한'],
    ['Noah', 'Noah의'],
  ])('%s의 첫 생일을 %s으로 표현한다', (name, intro) => {
    expect(getClosingCommentOptions('firstBirthday', name)).toContain(
      `${intro} 첫 생일을 함께 기뻐해 주세요.`
    );
  });

  it('이름이 없으면 각 문장을 그대로 사용할 수 있다', () => {
    const options = getClosingCommentOptions('firstBirthday', '   ');
    expect(options).toContain('첫 생일을 함께 기뻐해 주세요.');
    expect(options).toContain('첫돌을 소중한 마음으로 축하해 주세요.');
    expect(options.every(text => !text.includes('(아이)'))).toBe(true);
  });
});
