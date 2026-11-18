const NAVER_FONTS = {
  MaruBuri: {
    '200': 'MaruBuri-ExtraLight',
    '300': 'MaruBuri-Light',
    '400': 'MaruBuri-Regular',
    '600': 'MaruBuri-SemiBold',
    '700': 'MaruBuri-Bold',
  },
  '나눔 고딕': { '300': 'NanumGothicLight' },
  나눔명조: {
    '400': 'NanumMyeongjo',
    '700': 'NanumMyeongjoBold',
    '800': 'NanumMyeongjoExtraBold',
  },
  '나눔손글씨 펜': { '400': 'NanumPen' },
  '나눔스퀘어 기본': {
    '300': 'NanumSquareL',
    '400': 'NanumSquareR',
    '700': 'NanumSquareB',
    '800': 'NanumSquareEB',
  },
  '나눔스퀘어 라운드': {
    '300': 'NanumSquareRoundL',
    '400': 'NanumSquareRoundR',
    '700': 'NanumSquareRoundB',
    '800': 'NanumSquareRoundEB',
  },
  '나눔손글씨 갈맷글': { '400': 'NanumGarMaesGeur' },
  '나눔손글씨 나의 아내 손글씨': { '400': 'NanumNaEuiANaeSonGeurSsi' },
  '나눔손글씨 딸에게 엄마가': { '400': 'NanumDdarEGeEomMaGa' },
  '나눔손글씨 중학생': { '400': 'NanumJungHagSaeng' },
  '나눔손글씨 힘내라는 말보단': { '400': 'NanumHimNaeRaNeunMarBoDan' },
};

const BAEMIN_FONTS = {
  'BM 을지로': { '400': 'BMEULJIROTTF' },
  'BM 주아': { '400': 'BMJUA_ttf' },
};

const createFontFaces = (
  provider: 'naver' | 'baemin',
  families: Record<string, Record<string, string>>
) =>
  Object.entries(families).flatMap(([family, faces]) =>
    Object.entries(faces).map(([weight, fileName]) => ({
      family,
      weight,
      style: 'normal',
      url: `url(/font/${provider}/${fileName}.woff)`,
    }))
  );

export const PROVIDER_FONT_FACES = [
  ...createFontFaces('naver', NAVER_FONTS),
  ...createFontFaces('baemin', BAEMIN_FONTS),
];

export const FONT_GROUP_LABELS = {
  naver: '네이버 폰트',
  baemin: '배민 폰트',
  other: '기타 폰트',
};

const NAVER_FAMILIES = new Set([
  ...Object.keys(NAVER_FONTS),
  '나눔 스퀘어',
  '나눔 스퀘어 네오',
]);

const BAEMIN_FAMILIES = new Set([
  ...Object.keys(BAEMIN_FONTS),
  'BM Dohyeon',
  'BM 한나는11살체',
  'BM 연성',
]);

export const getFontGroup = (family: string) => {
  if (NAVER_FAMILIES.has(family)) return 'naver';
  if (BAEMIN_FAMILIES.has(family)) return 'baemin';
  return 'other';
};

const FONT_LABELS: Record<string, string> = {
  MaruBuri: '마루 부리',
  '나눔 스퀘어': '나눔스퀘어 AC',
  'BM Dohyeon': 'BM 도현',
};

export const getFontLabel = (family: string) => FONT_LABELS[family] ?? family;
