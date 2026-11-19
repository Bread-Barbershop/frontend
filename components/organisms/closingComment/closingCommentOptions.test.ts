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
    expect(
      getClosingCommentOptions('firstBirthday', { childName: name })
    ).toContain(`${intro} 첫 생일을 함께 기뻐해 주세요.`);
  });

  it('이름이 없으면 각 문장을 그대로 사용할 수 있다', () => {
    const options = getClosingCommentOptions('firstBirthday', {
      childName: '   ',
    });
    expect(options).toContain('첫 생일을 함께 기뻐해 주세요.');
    expect(options).toContain('첫돌을 소중한 마음으로 축하해 주세요.');
    expect(options.every(text => !text.includes('(아이)'))).toBe(true);
  });
});

describe('행사별 마무리 문구 예시', () => {
  it.each([
    ['지훈 · 수빈', '지훈 · 수빈이', '지훈 · 수빈과'],
    ['지훈 · 민서', '지훈 · 민서가', '지훈 · 민서와'],
    ['민서 · Alex', '민서 · Alex 두 사람이', '민서 · Alex 두 사람과'],
    ['', '두 사람이', '두 사람과'],
  ])(
    '결혼식 이름 %s에 맞게 주어와 동반 표현을 완성한다',
    (coupleNames, subject, together) => {
      const options = getClosingCommentOptions('wedding', { coupleNames });
      expect(options).toContain(`${subject} 함께하는 첫날을 축복해 주세요.`);
      expect(options).toContain(`귀한 시간 내어 ${together} 함께해 주세요.`);
    }
  );

  it.each([
    ['봄 세미나', '봄 세미나를', '봄 세미나가'],
    ['봄 포럼'.normalize('NFD'), '봄 포럼을', '봄 포럼이'],
    ['DevCon 2026', 'DevCon 2026 행사를', 'DevCon 2026 행사가'],
  ])(
    '행사명 %s으로 세미나와 기타 행사 문구를 만든다',
    (eventName, object, subject) => {
      expect(getClosingCommentOptions('seminar', { eventName })).toContain(
        `${object} 통해 새로운 연결을 만들어가요.`
      );
      expect(getClosingCommentOptions('etc', { eventName })).toContain(
        `${subject} 더 특별해질 수 있도록 함께해 주세요.`
      );
    }
  );

  it('생일 주인공의 이름을 입력한 그대로 사용한다', () => {
    expect(
      getClosingCommentOptions('birthday', { birthdayName: '하은이' })
    ).toContain('하은이의 생일을 함께 축하해 주세요.');
    expect(
      getClosingCommentOptions('birthday', { birthdayName: '하은' })
    ).toContain('하은에게 오늘의 축하가 가장 큰 선물이 됩니다.');
  });

  it.each(['wedding', 'seminar', 'birthday', 'etc'] as const)(
    '%s 탭에서 입력이 없어도 완성된 문장 열 개를 제시한다',
    category => {
      const options = getClosingCommentOptions(category);
      expect(options).toHaveLength(10);
      expect(options.join(' ')).not.toMatch(/\((신랑|신부|이름|행사명|주최)\)/);
    }
  );
});
