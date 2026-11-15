import type { ShowcaseInvitation } from '../showcaseInvitations';
import type { PosterDesign, PosterElement } from './types';

// Each composition is also the source for the editable Fabric canvas.
// Text is text, photographs are replaceable images; no flattened cover artwork.
export function createCollectionPoster(
  design: ShowcaseInvitation
): PosterDesign {
  const n = Number(design.id.replace('showcase-', ''));
  const [paper, accent, ink] = design.palette;
  const objects: PosterElement[] = [];
  const serif = 'Hahmlet';
  const sans = 'SUIT';
  const text = (
    value: string,
    x: number,
    y: number,
    width: number,
    size: number,
    options: Partial<Extract<PosterElement, { kind: 'text' }>> = {}
  ) => {
    objects.push({
      kind: 'text',
      text: value,
      x,
      y,
      width,
      fontSize: size,
      fontFamily: design.font,
      fill: ink,
      lineHeight: 1.25,
      ...options,
    });
  };
  const rect = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    stroke?: string
  ) =>
    objects.push({
      kind: 'rect',
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth: stroke ? 1 : 0,
    });
  const line = (x: number, y: number, width: number, color = accent) =>
    objects.push({
      kind: 'line',
      x,
      y,
      width,
      height: 0,
      stroke: color,
      strokeWidth: 1,
    });
  const circle = (
    x: number,
    y: number,
    diameter: number,
    fill: string,
    stroke?: string
  ) =>
    objects.push({
      kind: 'circle',
      x,
      y,
      width: diameter,
      height: diameter,
      fill,
      stroke,
      strokeWidth: 1,
    });
  const photo = (
    name: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const dimensions: Record<string, [number, number]> = {
      'vow-rings': [1100, 1375],
      'love-letter': [1100, 733],
      'garden-table': [1200, 800],
      'birthday-evening': [1100, 733],
      'birthday-table': [1200, 800],
      'first-cake': [289, 354],
      'conference-hall': [1100, 734],
      'conference-speaker': [600, 600],
    };
    const [sourceWidth, sourceHeight] = dimensions[name];
    objects.push({
      kind: 'image',
      src: `/images/showcase/${name}.webp`,
      x,
      y,
      width,
      height,
      sourceWidth,
      sourceHeight,
    });
  };
  const date = design.date.replaceAll('-', '.');
  const names = '민성 · 아현';
  const venue = design.venue.split(' · ')[0];
  const small = { fontFamily: sans, fontSize: 10, letterSpacing: 1.2 };
  const bottom = (y = 722, color = ink) => {
    line(28, y - 20, 319, color);
    text(`${date}  /  ${design.time}`, 28, y, 319, 12, {
      fontFamily: sans,
      fill: color,
    });
    text(venue, 28, y + 30, 319, 11, { fontFamily: sans, fill: color });
  };

  switch (n) {
    case 0: // A wedding announcement typeset as a small newspaper.
      text('THE WEDDING POST', 23, 34, 329, 24, {
        fontFamily: serif,
        fontWeight: '700',
      });
      line(23, 86, 329);
      line(23, 90, 329);
      text('서울  |  우리의 결혼 소식', 23, 103, 210, 9, {
        fontFamily: sans,
        textAlign: 'left',
      });
      text(date, 240, 103, 112, 9, { fontFamily: sans, textAlign: 'right' });
      text('오래도록,\n같은 편이 되기로', 23, 145, 329, 33, {
        fontFamily: serif,
      });
      photo('love-letter', 23, 253, 329, 254);
      text('박민성과 김아현, 결혼합니다.', 23, 530, 329, 18, {
        fontFamily: serif,
      });
      line(23, 574, 329);
      text(
        '함께 보낸 날들을 모아\n새로운 첫날을 시작합니다.',
        23,
        593,
        154,
        12,
        { textAlign: 'left', fontFamily: serif, lineHeight: 1.8 }
      );
      text('그 첫 장면에\n함께해 주세요.', 207, 593, 145, 12, {
        textAlign: 'left',
        fontFamily: serif,
        lineHeight: 1.8,
      });
      bottom();
      break;
    case 1:
      photo('vow-rings', 0, 0, 375, 812);
      rect(0, 0, 375, 200, '#222222');
      text('MINSUNG\n& AHHYUN', 25, 30, 325, 48, {
        fill: '#FFFFFF',
        fontFamily: sans,
        fontWeight: '700',
        textAlign: 'left',
        lineHeight: 1.05,
      });
      rect(0, 667, 375, 145, '#222222');
      bottom(714, '#FFFFFF');
      break;
    case 2:
      text('우리가 함께할', 25, 65, 325, 25, { fill: '#467399' });
      text('모든 계절', 25, 110, 325, 54, {
        fill: '#467399',
        fontFamily: serif,
      });
      photo('garden-table', 38, 225, 299, 337);
      text(names, 30, 596, 315, 19);
      bottom();
      break;
    case 3:
      rect(16, 16, 343, 780, accent);
      rect(29, 29, 317, 754, paper);
      text('A GARDEN WEDDING', 40, 62, 295, 10, { ...small, fill: accent });
      text('푸른 잎 사이로\n전하는 약속', 39, 113, 297, 31, {
        fontFamily: serif,
      });
      photo('garden-table', 49, 236, 277, 318);
      text(names, 45, 594, 285, 24, { fontFamily: serif });
      bottom();
      break;
    case 4:
      rect(20, 22, 335, 768, 'transparent', accent);
      rect(27, 29, 321, 754, 'transparent', accent);
      text('M & A', 50, 79, 275, 64, { fontFamily: serif, fill: accent });
      text('서로에게 쓰는\n가장 긴 편지', 40, 205, 295, 30, {
        fontFamily: serif,
        lineHeight: 1.6,
      });
      photo('love-letter', 56, 352, 263, 180);
      text('박민성  그리고  김아현', 32, 581, 311, 18, { fontFamily: serif });
      text('저희의 시작에 함께해 주세요.', 40, 632, 295, 12, {
        fontFamily: serif,
      });
      bottom();
      break;
    case 5:
      photo('garden-table', 0, 0, 375, 515);
      rect(0, 515, 375, 297, '#F1E9DF');
      text('여름의 한가운데', 24, 542, 327, 33, {
        textAlign: 'left',
        fontFamily: serif,
      });
      text('민성과 아현의 결혼식', 27, 603, 321, 14, { textAlign: 'left' });
      bottom();
      break;
    case 6:
      text('WITH\nYOU.', 24, 45, 327, 91, {
        textAlign: 'left',
        fontFamily: sans,
        fontWeight: '700',
        lineHeight: 0.94,
      });
      line(27, 258, 321, '#222222');
      photo('vow-rings', 115, 291, 233, 274);
      text('오래\n함께', 27, 302, 68, 26, {
        fontFamily: serif,
        textAlign: 'left',
        lineHeight: 1.6,
      });
      text('박민성 × 김아현', 27, 610, 321, 23, {
        fontFamily: sans,
        textAlign: 'left',
      });
      bottom();
      break;
    case 7:
      rect(0, 0, 375, 812, accent);
      rect(22, 30, 331, 661, paper);
      photo('garden-table', 36, 45, 303, 357);
      text('그날의 정원에서', 36, 444, 303, 31, { fontFamily: serif });
      text(names, 36, 514, 303, 18);
      text('소중한 분들과 함께하는 여름날의 결혼식', 36, 564, 303, 11);
      text(date, 36, 621, 303, 17, { fontFamily: serif });
      text(`${design.time}  /  ${venue}`, 22, 737, 331, 11, {
        fill: paper,
        fontFamily: sans,
      });
      break;
    case 8:
      text('Our city,\nour story.', 26, 38, 323, 45, {
        textAlign: 'left',
        fontFamily: serif,
      });
      photo('vow-rings', 26, 191, 154, 209);
      photo('love-letter', 194, 232, 155, 168);
      photo('garden-table', 26, 414, 323, 185);
      text('박민성 그리고 김아현', 26, 638, 323, 17, { textAlign: 'left' });
      bottom();
      break;
    case 9:
      text('좋아하는 길을\n함께 걷는 일', 28, 51, 319, 35, {
        textAlign: 'left',
        fontFamily: serif,
      });
      photo('garden-table', 0, 205, 375, 390);
      text('민성 · 아현', 28, 633, 319, 23, { textAlign: 'left' });
      bottom();
      break;
    case 10:
      rect(0, 0, 375, 812, '#C8463D');
      text('WE\nSAID\nYES!', 23, 38, 329, 96, {
        fill: '#FFFCF8',
        fontFamily: sans,
        fontWeight: '700',
        textAlign: 'left',
        lineHeight: 0.95,
      });
      circle(240, 375, 105, '#FFFCF8');
      text('03\n03', 250, 389, 85, 29, {
        fill: '#C8463D',
        fontFamily: sans,
        fontWeight: '700',
        lineHeight: 1,
      });
      text('민성과 아현의\n조금 다른 결혼식', 27, 504, 321, 26, {
        fill: '#FFFCF8',
        fontFamily: sans,
        fontWeight: '700',
        textAlign: 'left',
      });
      bottom(716, '#FFFCF8');
      break;
    case 11:
      photo('garden-table', 0, 0, 375, 812);
      rect(36, 156, 303, 503, '#F4F3EB');
      rect(44, 164, 287, 487, 'transparent', accent);
      text('함께\n뿌리내리는\n날', 62, 207, 251, 42, {
        fontFamily: serif,
        lineHeight: 1.4,
      });
      line(112, 422, 151);
      text(names, 60, 459, 255, 22, { fontFamily: serif });
      text(date, 60, 532, 255, 15, { fontFamily: serif });
      text(venue, 60, 575, 255, 11);
      break;
    case 12:
      rect(0, 0, 375, 812, '#245BC6');
      text('NEXT\nBUSINESS\n2026', 25, 48, 325, 52, {
        fontFamily: sans,
        fontWeight: '700',
        fill: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 1.08,
      });
      line(26, 263, 323, '#FFFFFF');
      text('다음을 만드는 사람들', 26, 293, 323, 24, {
        fontFamily: sans,
        fill: '#FFFFFF',
        textAlign: 'left',
      });
      photo('conference-hall', 26, 361, 323, 214);
      text('실행과 경험을 나누는 비즈니스 컨퍼런스', 26, 610, 323, 12, {
        fill: '#FFFFFF',
        fontFamily: sans,
        textAlign: 'left',
      });
      bottom(714, '#FFFFFF');
      break;
    case 13:
      rect(25, 31, 325, 750, '#E9EFE5');
      text('ADMIT ONE', 45, 58, 285, 11, {
        ...small,
        textAlign: 'left',
        fill: accent,
      });
      line(45, 97, 285);
      text('좋은 질문을\n가진 당신에게', 45, 133, 285, 34, {
        fontFamily: sans,
        fontWeight: '700',
        textAlign: 'left',
      });
      photo('conference-hall', 45, 260, 285, 208);
      text('NETWORKING SESSION', 45, 505, 285, 10, {
        ...small,
        textAlign: 'left',
      });
      text('대화의 다음 장', 45, 537, 285, 24, { textAlign: 'left' });
      for (let i = 0; i < 43; i++)
        rect(46 + i * 6.5, 638, i % 3 === 0 ? 3 : 1, 40, accent);
      text(`${date}  /  ${design.time}`, 45, 715, 285, 13, {
        fontFamily: sans,
        textAlign: 'left',
      });
      break;
    case 14:
      rect(0, 0, 375, 812, '#202526');
      text('OPEN\nMINDS.', 25, 45, 325, 71, {
        fontFamily: sans,
        fill: '#F8AC66',
        fontWeight: '700',
        textAlign: 'left',
        lineHeight: 1,
      });
      text('새로운 관점이 만나는 곳', 28, 236, 319, 17, {
        fill: '#FFFFFF',
        textAlign: 'left',
      });
      photo('conference-speaker', 143, 316, 204, 240);
      text('01\nTALK\n02\nCONNECT', 28, 322, 105, 13, {
        fill: '#F8AC66',
        fontFamily: sans,
        textAlign: 'left',
        lineHeight: 2,
      });
      bottom(713, '#FFFFFF');
      break;
    case 15:
      rect(0, 0, 375, 812, '#B63335');
      text('MAKE\nYOUR\nMOVE', 28, 44, 319, 76, {
        fill: '#FFF4F2',
        fontFamily: sans,
        textAlign: 'left',
        fontWeight: '700',
        lineHeight: 0.98,
      });
      rect(28, 325, 319, 2, '#FFF4F2');
      text('변화를 만드는\n한 번의 만남', 28, 368, 319, 29, {
        fill: '#FFF4F2',
        fontFamily: sans,
        textAlign: 'left',
      });
      text(
        '15:00  KEYNOTE\n16:00  CONVERSATION\n16:30  NEXT STEP',
        28,
        512,
        319,
        14,
        {
          fill: '#FFF4F2',
          fontFamily: sans,
          textAlign: 'left',
          lineHeight: 2.2,
        }
      );
      bottom(713, '#FFF4F2');
      break;
    case 16:
      text('대화의\n여백', 33, 54, 309, 68, {
        fontFamily: serif,
        textAlign: 'left',
        lineHeight: 1.1,
      });
      text('THOUGHTFUL CONVERSATIONS', 35, 245, 305, 9, {
        ...small,
        textAlign: 'left',
      });
      photo('conference-hall', 35, 302, 305, 218);
      text(
        '커피 한 잔, 좋은 질문 하나.\n조금 더 깊이 이야기하는 오후.',
        35,
        563,
        305,
        16,
        { fontFamily: serif, textAlign: 'left', lineHeight: 1.8 }
      );
      bottom();
      break;
    case 17:
      photo('birthday-evening', 0, 0, 375, 475);
      rect(0, 475, 375, 337, '#EFE4C9');
      text('Cheers\nto 27', 26, 496, 323, 60, {
        fontFamily: serif,
        textAlign: 'left',
        lineHeight: 1.05,
      });
      text('생일 핑계로 모여요. 민혁 드림.', 28, 651, 319, 13, {
        textAlign: 'left',
      });
      bottom(721);
      break;
    case 18:
      text('나의 생일,\n우리의 저녁.', 28, 44, 319, 35, {
        fontFamily: serif,
        textAlign: 'left',
      });
      rect(24, 185, 327, 398, '#FFFFFF');
      photo('birthday-evening', 37, 198, 301, 313);
      text('오랜만에 한자리에 모일 우리', 40, 541, 295, 12, {
        fontFamily: serif,
      });
      text('편하게 와요. 맛있는 거 먹자.', 28, 630, 319, 15, {
        fontFamily: serif,
        textAlign: 'left',
      });
      bottom();
      break;
    case 19:
      rect(0, 0, 375, 812, '#F4C9D3');
      rect(18, 18, 339, 776, 'transparent', '#AD526E');
      text('cake\nclub', 30, 47, 315, 87, {
        fontFamily: serif,
        fill: '#963B59',
        lineHeight: 0.95,
      });
      photo('birthday-table', 39, 279, 297, 252);
      text('한 조각 더 먹고 가요.', 35, 571, 305, 23, {
        fontFamily: 'LINESeedKR',
        fill: '#963B59',
      });
      text('민혁의 생일 파티에 초대합니다', 35, 624, 305, 12, {
        fill: '#963B59',
      });
      bottom(721, '#963B59');
      break;
    case 20:
      rect(0, 0, 375, 812, '#E8ECBC');
      text('27', 12, 28, 351, 230, {
        fontFamily: sans,
        fontWeight: '700',
        fill: '#874B69',
        lineHeight: 1,
      });
      rect(26, 327, 323, 1, '#874B69');
      text('TWENTY\nSEVEN\nCLUB', 26, 367, 323, 47, {
        fontFamily: sans,
        fontWeight: '700',
        fill: '#874B69',
        textAlign: 'left',
        lineHeight: 1.05,
      });
      text('좋아하는 노래 한 곡씩 가져와.', 26, 574, 323, 14, {
        fill: '#874B69',
        textAlign: 'left',
      });
      bottom(721, '#874B69');
      break;
    case 21:
      text('민준이의\n첫 번째 해', 28, 37, 319, 36, {
        fontFamily: '고운 바탕',
        textAlign: 'left',
      });
      rect(25, 175, 325, 343, '#FFFFFF');
      photo('first-cake', 40, 190, 295, 280);
      text('하루하루 모아, 어느새 365일', 40, 489, 295, 12, {
        fontFamily: '고운 바탕',
      });
      circle(260, 549, 69, '#D6BD88');
      text('한 살', 267, 570, 55, 19, { fontFamily: '고운 바탕' });
      text('함께 웃었던 분들과\n작은 생일잔치를 엽니다.', 28, 565, 224, 18, {
        fontFamily: '고운 바탕',
        textAlign: 'left',
        lineHeight: 1.7,
      });
      bottom();
      break;
    default:
      rect(0, 0, 375, 812, '#DBE6F4');
      text('안녕,\n나는 한 살!', 28, 42, 319, 45, {
        fontFamily: 'LINESeedKR',
        fill: '#47629A',
        textAlign: 'left',
        fontWeight: '700',
      });
      circle(65, 226, 245, '#F3F7FF');
      photo('first-cake', 100, 251, 175, 198);
      text('민준이의 첫 생일', 28, 515, 319, 27, {
        fontFamily: 'LINESeedKR',
        fill: '#47629A',
      });
      text('나랑 같이 케이크 먹을래요?', 28, 576, 319, 15, {
        fontFamily: 'LINESeedKR',
        fill: '#47629A',
      });
      bottom(721);
      break;
  }
  return { width: 375, height: 812, background: paper, objects };
}
