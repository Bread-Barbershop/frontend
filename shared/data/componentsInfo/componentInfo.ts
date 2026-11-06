import { InvitationType } from '@/shared/types/block';
import { BlockType } from '@/shared/types/editor';

export type SampleDataType = {
  english: InvitationType;
  korea: string;
  list: ListType[];
};

export type ListType = {
  contents: string;
  component: BlockType | null;
  isType: boolean;
  aliases?: string[];
};
const BLOCK_SEARCH_ALIASES: Partial<Record<BlockType, string[]>> = {
  greeting: ['초대글', '초대말', '환영인사', '인사', 'welcome'],
  coupleIntroduction: ['신랑신부', '커플소개', '부부소개', 'groom', 'bride'],
  myFamilyWedding: ['혼주', '가족', '부모님', 'family'],
  myFamily: ['가족', '부모님', 'family'],
  myChild: ['아기', '아이', '아기소개', 'baby'],
  calendar: ['달력', '캘린더', '날짜', '시간', '일정', '요일', '일시', 'date', 'calendar'],
  place: ['지도', '오시는길', '위치', '약도', '웨딩홀', '식장', '장소', '네이버지도', '카카오맵', '티맵', 'map'],
  gallery: ['사진첩', '앨범', '사진모음', '웨딩사진', '스냅', '슬라이드', '필름', 'album', 'gallery'],
  picture: ['이미지', '그림', '포토', '스냅', '단일사진', '픽처', 'image', 'photo', 'pic'],
  phone: ['전화', '전화번호', '연락', '번호', '통화', '문자', '혼주연락처', 'call', 'phone', 'tel'],
  bgm: ['음악', '노래', '브금', '음원', '오디오', '사운드', 'music', 'bgm', 'song'],
  account: ['축의금', '마음전하실곳', '후원금', '입금', '송금', '카카오페이', '토스', '돈', '은행', 'bank', 'pay'],
  interview: ['문답', '질문', '답변', '인터뷰', 'qna', 'interview'],
  notice: ['안내', '안내문', '공지', '알림', 'notice'],
  video: ['비디오', '유튜브', '식전영상', '영상', '무비', '클립', 'youtube', 'video'],
  closingComment: ['마무리', '맺음말', '감사인사', '끝인사', 'closing'],
  organizerInformation: ['주최', '주최사', '행사주최', 'organizer'],
  sponsorshipInfomation: ['후원', '협찬', '스폰서', 'sponsor'],
  speakerInformation: ['연사', '발표자', '강연자', 'speaker'],
};

const withSearchAliases = (items: ListType[]): ListType[] =>
  items.map(item => ({
    ...item,
    ...(item.component && BLOCK_SEARCH_ALIASES[item.component]
      ? { aliases: BLOCK_SEARCH_ALIASES[item.component] }
      : {}),
  }));


export const weddingComponents: ListType[] = withSearchAliases([
  { contents: '인사말', component: 'greeting', isType: false },
  { contents: '신랑신부소개', component: 'coupleIntroduction', isType: false },
  { contents: '가족소개', component: 'myFamilyWedding', isType: false },
  { contents: '예식일시', component: 'calendar', isType: false },
  { contents: '예식장소', component: 'place', isType: false },
  { contents: '갤러리', component: 'gallery', isType: true },
  { contents: '연락처', component: 'phone', isType: false },
  { contents: '배경음악', component: 'bgm', isType: false },
  { contents: '계좌번호', component: 'account', isType: false },
  // { contents: '방명록', component: null, isType: false },
  { contents: '인터뷰', component: 'interview', isType: false },
  // { contents: '모청스냅', component: null, isType: false },
  { contents: '공지사항', component: 'notice', isType: false },
  { contents: '동영상', component: 'video', isType: false },
  { contents: '사진', component: 'picture', isType: false },
  { contents: '마무리문구', component: 'closingComment', isType: false },
  // { contents: '세례명', component: null, isType: false },
]);
export const firstBirthdayComponents: ListType[] = withSearchAliases([
  { contents: '인사말', component: 'greeting', isType: false },
  { contents: '행사일시', component: 'calendar', isType: false },
  { contents: '아기소개', component: 'myChild', isType: false },
  { contents: '가족소개', component: 'myFamily', isType: false },
  { contents: '행사장소', component: 'place', isType: false },
  { contents: '갤러리', component: 'gallery', isType: true },
  { contents: '연락처', component: 'phone', isType: false },
  { contents: '계좌번호', component: 'account', isType: false },
  { contents: '배경음악', component: 'bgm', isType: false },
  // { contents: '모청스냅', component: null, isType: false },
  // { contents: '이벤트', component: null, isType: false },
  // { contents: '방명록', component: null, isType: false },
  { contents: '공지사항', component: 'notice', isType: false },
  { contents: '동영상', component: 'video', isType: false },
  { contents: '사진', component: 'picture', isType: false },
  { contents: '마무리문구', component: 'closingComment', isType: false },
]);
export const birthdayComponents: ListType[] = withSearchAliases([
  { contents: '인사말', component: 'greeting', isType: false },
  { contents: '행사일시', component: 'calendar', isType: false },
  { contents: '행사장소', component: 'place', isType: false },
  { contents: '연락처', component: 'phone', isType: false },
  { contents: '배경음악', component: 'bgm', isType: false },
  // { contents: '모청스냅', component: null, isType: false },
  // { contents: '방명록', component: null, isType: false },
  { contents: '공지사항', component: 'notice', isType: false },
  { contents: '동영상', component: 'video', isType: false },
  { contents: '사진', component: 'picture', isType: false },
  { contents: '마무리문구', component: 'closingComment', isType: false },
]);
export const seminarComponents: ListType[] = withSearchAliases([
  { contents: '인사말', component: 'greeting', isType: false },
  { contents: '주최정보', component: 'organizerInformation', isType: false },
  { contents: '후원정보', component: 'sponsorshipInfomation', isType: false },
  { contents: '연사정보', component: 'speakerInformation', isType: false },
  { contents: '행사일시', component: 'calendar', isType: false },
  { contents: '행사장소', component: 'place', isType: false },
  { contents: '계좌번호', component: 'account', isType: false },
  { contents: '공지사항', component: 'notice', isType: false },
  { contents: '연락처', component: 'phone', isType: false },
  { contents: '동영상', component: 'video', isType: false },
  { contents: '사진', component: 'picture', isType: false },
  { contents: '마무리문구', component: 'closingComment', isType: false },
]);
export const etcComponents: ListType[] = withSearchAliases([
  { contents: '인사말', component: 'greeting', isType: false },
  { contents: '행사일시', component: 'calendar', isType: false },
  { contents: '행사장소', component: 'place', isType: false },
  { contents: '공지사항', component: 'notice', isType: false },
  { contents: '연락처', component: 'phone', isType: false },
  { contents: '동영상', component: 'video', isType: false },
  { contents: '사진', component: 'picture', isType: false },
  { contents: '마무리문구', component: 'closingComment', isType: false },
]);

export const componentCls: SampleDataType[] = [
  {
    english: 'wedding',
    korea: '결혼식',
    list: weddingComponents,
  },
  {
    english: 'firstBirthday',
    korea: '돌잔치',
    list: firstBirthdayComponents,
  },
  {
    english: 'birthday',
    korea: '생일',
    list: birthdayComponents,
  },
  {
    english: 'seminar',
    korea: '세미나',
    list: seminarComponents,
  },
  {
    english: 'etc',
    korea: '기타',
    list: etcComponents,
  },
];
