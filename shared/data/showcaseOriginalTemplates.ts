export type ShowcaseOriginalTemplate = {
  jsonUrl: string;
  thumbnailUrl: string;
  fontFamilies: readonly string[];
};

const original = (
  filename: string,
  thumbnailExtension: 'png' | 'webp',
  fontFamilies: readonly string[]
): ShowcaseOriginalTemplate => ({
  jsonUrl: `/templates/json/${filename}.v1.json`,
  thumbnailUrl: `/templates/thumbnails/${filename}.${thumbnailExtension}`,
  fontFamilies,
});

// The home showcase ID is the stable key used by previews, templates, and the editor.
export const SHOWCASE_ORIGINAL_TEMPLATES: Record<
  string,
  ShowcaseOriginalTemplate
> = {
  'showcase-0': original('wedding_10', 'webp', [
    'Pretendard',
    'Cormorant SC',
    'Old Standard TT',
  ]),
  'showcase-1': original('wedding_01', 'webp', ['Pretendard', 'SUIT']),
  'showcase-2': original('wedding_02_eng', 'webp', [
    'Pretendard',
    'Allura',
    'Cormorant Garamond',
    'Oswald',
  ]),
  'showcase-3': original('wedding_03', 'webp', [
    'Pretendard',
    'Allura',
    'Oswald',
    'SUIT',
  ]),
  'showcase-4': original('wedding_04', 'webp', [
    'Pretendard',
    'Italianno',
    'SUIT',
  ]),
  'showcase-5': original('wedding_05', 'webp', [
    'Pretendard',
    'Jost',
    'SUIT',
    'Oswald',
    'Pathway Gothic One',
  ]),
  'showcase-6': original('wedding_06', 'webp', [
    'Pretendard',
    'Rosarivo',
    'Ruwudu',
    '고운 바탕',
  ]),
  'showcase-7': original('wedding_07', 'png', [
    'Barlow Condensed',
    'Pretendard',
    'Qwigley',
    'Pathway Gothic One',
    'Noto Sans KR',
  ]),
  'showcase-8': original('wedding_08', 'webp', [
    'Pretendard',
    'DM Serif Display',
    '나눔 스퀘어 네오',
  ]),
  'showcase-9': original('wedding_09', 'webp', [
    'Pretendard',
    'Sora',
    'Mrs Saint Delafield',
    'Manrope',
    'LINESeedKR',
  ]),
  'showcase-10': original('wedding_11', 'webp', [
    'Pretendard',
    'Permanent Marker',
    'Kalam',
    'LINESeedKR',
  ]),
  'showcase-11': original('wedding_12', 'png', [
    'Pretendard',
    'Prata',
    'TenorSans',
    'Noto Serif KR',
  ]),
  'showcase-12': original('seminar_01', 'png', [
    'Anton',
    'Bebas Neue',
    'LINESeedKR',
    'IBM Plex Sans',
    'Pretendard',
  ]),
  'showcase-13': original('seminar_02', 'png', [
    'Archivo',
    'Urbanist',
    'Paperlogy',
    'Pathway Gothic One',
  ]),
  'showcase-14': original('seminar_03', 'png', [
    'Clash Grotesk',
    'DM Sans',
    'G마켓 산스',
    'Source Sans 3',
  ]),
  'showcase-15': original('seminar_04', 'png', [
    'Figtree',
    'Epilogue',
    'GothicA1',
  ]),
  'showcase-16': original('seminar_05', 'png', [
    'Poppins',
    'Heebo',
    '나눔 고딕',
  ]),
  'showcase-17': original('birthday_01', 'png', [
    'Red Hat Display',
    'Pretendard',
    'BM Dohyeon',
    'M Plus 1',
    'ONE Mobile Title',
  ]),
  'showcase-18': original('birthday_02', 'png', [
    'Tungsten Narrow',
    'MicrogrammaDExtended',
    'Saira Condensed',
    'BM Dohyeon',
  ]),
  'showcase-19': original('birthday_03', 'png', [
    'Russo One',
    'Pretendard',
    'Clash Grotesk',
    'BM 한나는11살체',
    'Rajdhani',
  ]),
  'showcase-20': original('birthday_04', 'png', [
    'Tungsten Narrow',
    'Dela Gothic One',
    'Exo2',
    '나눔 스퀘어',
  ]),
  'showcase-21': original('firstBirthday_01', 'png', ['BM 연성']),
  'showcase-22': original('firstBirthday_02', 'png', ['ONE Mobile POP']),
  'showcase-23': original('wedding_13', 'webp', [
    'Pretendard',
    'Bodoni Moda',
    'Bona Nova',
    'Manrope',
    'Noto Serif KR',
    'Noto Serif',
  ]),
  'showcase-24': original('wedding_14', 'webp', [
    'Pretendard',
    'Pathway Gothic One',
  ]),
  'showcase-25': original('firstBirthday_03', 'webp', ['고운 바탕', 'SUIT']),
  'showcase-26': original('firstBirthday_04', 'webp', [
    'DM Serif Display',
    'LINESeedKR',
    'SUIT',
    '고운 바탕',
  ]),
  'showcase-27': original('firstBirthday_05', 'webp', [
    'SUIT',
    'Noto Serif KR',
    'Barlow Condensed',
    '고운 바탕',
  ]),
  'showcase-28': original('firstBirthday_06', 'webp', [
    'Cormorant Garamond',
    '고운 바탕',
    'SUIT',
  ]),
  'showcase-29': original('firstBirthday_07', 'webp', [
    'SUIT',
    'Barlow Condensed',
    'Bodoni Moda',
    'Noto Serif KR',
  ]),
  'showcase-30': original('firstBirthday_08', 'webp', [
    'SUIT',
    'Anton',
    'ONE Mobile POP',
    'Barlow Condensed',
  ]),
  'showcase-31': original('firstBirthday_09', 'webp', ['SUIT', '고운 바탕']),
  'showcase-32': original('birthday_05', 'webp', [
    'SUIT',
    'Anton',
    'DM Serif Display',
  ]),
  'showcase-33': original('birthday_06', 'webp', [
    'Bodoni Moda',
    '고운 바탕',
    'SUIT',
  ]),
  'showcase-34': original('birthday_07', 'webp', [
    'SUIT',
    'Anton',
    'Noto Serif KR',
    'Barlow Condensed',
  ]),
  'showcase-35': original('birthday_08', 'webp', [
    'Cormorant Garamond',
    '고운 바탕',
    'SUIT',
  ]),
  'showcase-36': original('birthday_09', 'webp', [
    'SUIT',
    'LINESeedKR',
    '고운 바탕',
  ]),
  'showcase-37': original('seminar_06', 'webp', [
    'SUIT',
    'DM Serif Display',
    '고운 바탕',
  ]),
  'showcase-38': original('seminar_07', 'webp', ['SUIT', 'Barlow Condensed']),
  'showcase-39': original('seminar_08', 'webp', ['SUIT']),
  'showcase-40': original('seminar_09', 'webp', [
    'SUIT',
    'DM Serif Display',
    '고운 바탕',
  ]),
};

export function getShowcaseOriginalTemplate(id: string) {
  return SHOWCASE_ORIGINAL_TEMPLATES[id];
}
