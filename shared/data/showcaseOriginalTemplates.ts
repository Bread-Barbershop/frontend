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
};

export function getShowcaseOriginalTemplate(id: string) {
  return SHOWCASE_ORIGINAL_TEMPLATES[id];
}
