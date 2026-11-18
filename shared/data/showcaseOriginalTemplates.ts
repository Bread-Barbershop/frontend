export type ShowcaseOriginalTemplate = {
  jsonUrl: string;
  thumbnailUrl: string;
  fontFamilies: readonly string[];
};

const original = (
  filename: string,
  fontFamilies: readonly string[]
): ShowcaseOriginalTemplate => ({
  jsonUrl: `/templates/json/${filename}.v1.json`,
  thumbnailUrl: `/templates/thumbnails/${filename}.webp`,
  fontFamilies,
});

// The home showcase ID is the stable key used by previews, templates, and the editor.
export const SHOWCASE_ORIGINAL_TEMPLATES: Record<
  string,
  ShowcaseOriginalTemplate
> = {
  'showcase-0': original('wedding_10', [
    'Pretendard',
    'Cormorant SC',
    'Old Standard TT',
  ]),
  'showcase-1': original('wedding_01', ['Pretendard', 'SUIT']),
  'showcase-2': original('wedding_02_eng', [
    'Pretendard',
    'Allura',
    'Cormorant Garamond',
    'Oswald',
  ]),
  'showcase-3': original('wedding_03', [
    'Pretendard',
    'Allura',
    'Oswald',
    'SUIT',
  ]),
  'showcase-4': original('wedding_04', [
    'Pretendard',
    'Italianno',
    'SUIT',
  ]),
  'showcase-5': original('wedding_05', [
    'Pretendard',
    'Jost',
    'SUIT',
    'Oswald',
    'Pathway Gothic One',
  ]),
  'showcase-6': original('wedding_06', [
    'Pretendard',
    'Rosarivo',
    'Ruwudu',
    '고운 바탕',
  ]),
  'showcase-7': original('wedding_07', [
    'Barlow Condensed',
    'Pretendard',
    'Qwigley',
    'Pathway Gothic One',
    'Noto Sans KR',
  ]),
  'showcase-8': original('wedding_08', [
    'Pretendard',
    'DM Serif Display',
    '나눔 스퀘어 네오',
  ]),
  'showcase-9': original('wedding_09', [
    'Pretendard',
    'Sora',
    'Mrs Saint Delafield',
    'Manrope',
    'LINESeedKR',
  ]),
  'showcase-10': original('wedding_11', [
    'Pretendard',
    'Permanent Marker',
    'Kalam',
    'LINESeedKR',
  ]),
  'showcase-11': original('wedding_12', [
    'Pretendard',
    'Prata',
    'TenorSans',
    'Noto Serif KR',
  ]),
  'showcase-12': original('seminar_01', [
    'Anton',
    'Bebas Neue',
    'LINESeedKR',
    'IBM Plex Sans',
    'Pretendard',
  ]),
  'showcase-13': original('seminar_02', [
    'Archivo',
    'Urbanist',
    'Paperlogy',
    'Pathway Gothic One',
  ]),
  'showcase-14': original('seminar_03', [
    'Clash Grotesk',
    'DM Sans',
    'G마켓 산스',
    'Source Sans 3',
  ]),
  'showcase-15': original('seminar_04', [
    'Figtree',
    'Epilogue',
    'GothicA1',
  ]),
  'showcase-16': original('seminar_05', [
    'Poppins',
    'Heebo',
    '나눔 고딕',
  ]),
  'showcase-17': original('birthday_01', [
    'Red Hat Display',
    'Pretendard',
    'BM Dohyeon',
    'M Plus 1',
    'ONE Mobile Title',
  ]),
  'showcase-18': original('birthday_02', [
    'Tungsten Narrow',
    'MicrogrammaDExtended',
    'Saira Condensed',
    'BM Dohyeon',
  ]),
  'showcase-19': original('birthday_03', [
    'Russo One',
    'Pretendard',
    'Clash Grotesk',
    'BM 한나는11살체',
    'Rajdhani',
  ]),
  'showcase-20': original('birthday_04', [
    'Tungsten Narrow',
    'Dela Gothic One',
    'Exo2',
    '나눔 스퀘어',
  ]),
  'showcase-21': original('firstBirthday_01', ['BM 연성']),
  'showcase-22': original('firstBirthday_02', ['ONE Mobile POP']),
  'showcase-23': original('wedding_13', [
    'Pretendard',
    'Bodoni Moda',
    'Bona Nova',
    'Manrope',
    'Noto Serif KR',
    'Noto Serif',
  ]),
  'showcase-24': original('wedding_14', [
    'Pretendard',
    'Pathway Gothic One',
  ]),
  'showcase-25': original('firstBirthday_03', ['고운 바탕', 'SUIT']),
  'showcase-26': original('firstBirthday_04', [
    'DM Serif Display',
    'LINESeedKR',
    'SUIT',
    '고운 바탕',
  ]),
  'showcase-27': original('firstBirthday_05', [
    'SUIT',
    'Noto Serif KR',
    'Barlow Condensed',
    '고운 바탕',
  ]),
  'showcase-28': original('firstBirthday_06', [
    'Cormorant Garamond',
    '고운 바탕',
    'SUIT',
  ]),
  'showcase-29': original('firstBirthday_07', [
    'SUIT',
    'Barlow Condensed',
    'Bodoni Moda',
    'Noto Serif KR',
  ]),
  'showcase-30': original('firstBirthday_08', [
    'SUIT',
    'Anton',
    'ONE Mobile POP',
    'Barlow Condensed',
  ]),
  'showcase-31': original('firstBirthday_09', ['SUIT', '고운 바탕']),
  'showcase-32': original('birthday_05', [
    'SUIT',
    'Anton',
    'DM Serif Display',
  ]),
  'showcase-33': original('birthday_06', [
    'Bodoni Moda',
    '고운 바탕',
    'SUIT',
  ]),
  'showcase-34': original('birthday_07', [
    'SUIT',
    'Anton',
    'Noto Serif KR',
    'Barlow Condensed',
  ]),
  'showcase-35': original('birthday_08', [
    'Cormorant Garamond',
    '고운 바탕',
    'SUIT',
  ]),
  'showcase-36': original('birthday_09', [
    'SUIT',
    'LINESeedKR',
    '고운 바탕',
  ]),
  'showcase-37': original('seminar_06', [
    'SUIT',
    'DM Serif Display',
    '고운 바탕',
  ]),
  'showcase-38': original('seminar_07', ['SUIT', 'Barlow Condensed']),
  'showcase-39': original('seminar_08', ['SUIT']),
  'showcase-40': original('seminar_09', [
    'SUIT',
    'DM Serif Display',
    '고운 바탕',
  ]),
};

export function getShowcaseOriginalTemplate(id: string) {
  return SHOWCASE_ORIGINAL_TEMPLATES[id];
}
