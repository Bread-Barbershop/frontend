import type { InvitationType } from '@/shared/types/block';

import type { SectionStyle } from './sectionStyles';
import type { ShowcaseSection } from './showcaseSections';

export type ShowcaseInvitation = {
  id: string;
  type: Exclude<InvitationType, 'etc'>;
  name: string;
  description: string;
  palette: [background: string, accent: string, text: string];
  font: string;
  eyebrow: string;
  heading: string;
  message: string[];
  date: string;
  time: string;
  venue: string;
  sections: ShowcaseSection[];
  sectionStyle: SectionStyle;
};

const wedding = {
  type: 'wedding',
  date: '2026-08-11',
  time: '15:00',
  venue: '인비아 웨딩홀 · 8층 그랜드홀',
  font: 'Hahmlet',
} as const;
const seminar = {
  type: 'seminar',
  date: '2026-08-11',
  time: '15:00',
  venue: '인비아 컨퍼런스 · 메인 오디토리움',
  font: 'SUIT',
} as const;
const birthday = {
  type: 'birthday',
  date: '2026-08-11',
  time: '15:00',
  venue: '인비아 라운지 · 프라이빗 다이닝룸',
  font: 'SUIT',
} as const;
const firstBirthday = {
  type: 'firstBirthday',
  date: '2026-08-11',
  time: '15:00',
  venue: '인비아 패밀리룸 · 8층',
  font: '고운 바탕',
} as const;

export const SHOWCASE_CATEGORY_LABELS = {
  wedding: '웨딩',
  seminar: '세미나',
  birthday: '생일',
  firstBirthday: '돌잔치',
} as const;

// 표지에 담긴 날짜·이름·분위기를 본문에서도 이어가는, 공개용 완성 샘플이다.
export const SHOWCASE_INVITATIONS: ShowcaseInvitation[] = [
  {
    ...wedding,
    id: 'showcase-0',
    name: '클래식 모먼트',
    date: '2026-08-08',
    description: '한 장의 신문처럼, 오래 간직하고 싶은 우리의 첫 소식.',
    palette: ['#F8F5EF', '#705039', '#423A34'],
    eyebrow: 'THE BEGINNING OF FOREVER',
    heading: '민성과 아현, 결혼합니다',
    message: [
      '매일 저녁 서로의 하루를 묻던 두 사람이 이제 한집에서 아침을 맞습니다. 저희의 첫 소식을 전합니다.',
    ],
    sectionStyle: 'paper',
    sections: [
      { component: 'greeting' },
      {
        component: 'interview',
        title: '두 사람을 만나다',
        question: '두 분의 첫 대화는 기억나나요?',
        answer:
          '비가 오던 날, 버스 정류장에서 우산을 같이 썼어요. 버스가 한 대 더 지나갈 때까지 이야기했지요.',
        image: '/images/showcase/love-letter.webp',
      },
      {
        component: 'picture',
        title: '사진으로 전하는 한 컷',
        image:
          '/samples/wedding_14/images/04_779358cc-330b-4bb4-818b-6b1c2e91958c.jpg',
        caption:
          '촬영을 마치려던 참에 해가 났습니다. 그날 가장 좋아하게 된 사진이에요.',
      },
      { component: 'calendar', title: '예식 일시' },
      {
        component: 'timeline',
        title: '그날의 식순',
        items: [
          { time: '14:30', title: '하객 맞이' },
          { time: '15:00', title: '혼인 서약' },
          { time: '16:00', title: '축하 식사' },
        ],
      },
      {
        component: 'mealMenu',
        title: '축하 오찬 메뉴',
        subtitle: 'Wedding Lunch',
        style: 'classic',
        courses: [
          { name: '따뜻한 요리', dishes: ['양송이 수프', '허브 치킨'] },
          { name: '후식', dishes: ['복숭아 셔벗'] },
        ],
      },
      { component: 'place', title: '예식장 안내' },
      {
        component: 'notice',
        title: '오늘의 신문을 드립니다',
        heading: '로비에서 한 부씩 가져가세요',
        message:
          '두 사람의 인터뷰와 웨딩 촬영 사진을 실은 작은 신문을 접수대에 두었습니다. 집에 가는 길에 펼쳐 보세요.',
        preset: 'time',
        image: '/images/showcase/vow-rings.webp',
      },
      {
        component: 'closingComment',
        message:
          '오늘 소식의 마지막 줄에는 이 자리에 와 주신 분들의 이름을 담고 싶습니다. 민성·아현 올림',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-1',
    name: '어반 모노크롬',
    date: '2026-03-17',
    font: 'SUIT',
    description: '흑백 사진과 담백한 여백으로 전하는 단단한 약속.',
    palette: ['#FFFFFF', '#222222', '#454545'],
    eyebrow: 'MIN SUNG & AH HYUN',
    heading: '같은 보폭으로',
    message: [
      '신호가 바뀔 때마다 걸음을 맞추던 우리가 부부가 됩니다. 가까이에서 축하해 주시면 기쁘겠습니다.',
    ],
    sectionStyle: 'plain',
    sections: [
      {
        component: 'picture',
        title: '우리의 반지',
        image: '/images/showcase/vow-rings.webp',
        caption: '두 사람이 고른, 장식 없는 한 쌍.',
      },
      { component: 'greeting' },
      {
        component: 'coupleIntroduction',
        title: '나란히 걷는 사람들',
        story:
          '민성은 골목을 기억하고 아현은 가게 이름을 기억합니다. 낯선 동네에서도 둘이면 길을 잘 찾아요.',
      },
      { component: 'calendar', title: '3월의 예식' },
      {
        component: 'dressCode',
        title: '흑백사진에 담길 옷차림',
        colors: ['#262626', '#757575', '#E5E1DB'],
        guidelines: [
          '가족사진은 흑백으로도 한 장 남겨요. 평소 좋아하는 편한 옷으로 와 주세요.',
        ],
      },
      { component: 'place', title: '만나는 곳' },
      {
        component: 'transportation',
        title: '그랜드홀까지',
        subwayStation: '강남역',
        subwayExit: '11번 출구',
        subwayWalk:
          '테헤란로1길 입구에서 건물 로비로 들어와 8층으로 올라오세요.',
      },
      {
        component: 'closingComment',
        message:
          '사진 속 빈자리에는 그날의 여러분을 모시고 싶습니다. 민성 · 아현',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-2',
    name: '블루 스카이',
    date: '2026-03-03',
    description: '맑은 하늘 아래, 가볍고 투명하게 피어나는 설렘.',
    palette: ['#F1F7FA', '#496D86', '#394F5F'],
    eyebrow: 'UNDER THE SAME SKY',
    heading: '맑은 날에도, 비 오는 날에도',
    message: [
      '같은 하늘 아래 서로의 편이 되기로 했습니다. 봄이 막 시작되는 날, 저희 결혼식에 초대합니다.',
    ],
    sectionStyle: 'rounded',
    sections: [
      { component: 'greeting' },
      {
        component: 'calendar',
        title: '우리의 봄날',
        template: 'calendarType2',
      },
      {
        component: 'picture',
        title: '봄바람 불던 오후',
        image:
          '/samples/wedding_14/images/05_b1c68d54-033d-4053-9dc6-f9b05cc6b9ef.jpg',
        caption: '바람이 불 때마다 웃음이 났던 촬영 날입니다.',
      },
      { component: 'place', title: '예식이 열리는 곳' },
      {
        component: 'timeline',
        title: '봄날의 식순',
        items: [
          { time: '14:40', title: '로비에서 인사' },
          { time: '15:00', title: '서로에게 쓰는 서약' },
          { time: '15:40', title: '함께 찍는 첫 가족사진' },
        ],
      },
      {
        component: 'faq',
        title: '봄날의 하객 안내',
        items: [
          {
            question: '예식은 야외에서 하나요?',
            answer:
              '예식은 실내 그랜드홀에서 진행합니다. 바깥에서 사진을 남기실 분은 가벼운 겉옷을 챙겨 주세요.',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '예식 뒤 따뜻한 한 끼',
        subtitle: 'Spring Table',
        style: 'minimal',
        courses: [
          { name: '첫 접시', dishes: ['봄나물과 구운 감자'] },
          { name: '식사', dishes: ['버섯 솥밥과 맑은 국'] },
        ],
      },
      {
        component: 'closingComment',
        message:
          '올봄을 떠올릴 때마다 이날의 얼굴들도 같이 떠오를 것 같아요. 민성·아현 드림',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-3',
    name: '선라이트 가든',
    venue: '인비아 가든 · 야외 예식장',
    description: '햇살과 초록을 담은, 자연스러운 가든 세리머니.',
    palette: ['#F7F7EB', '#5C6541', '#434B36'],
    eyebrow: 'A DAY IN OUR GARDEN',
    heading: '정원에서 혼인 서약을 나눕니다',
    message: [
      '꽃길 끝에 작은 식탁을 차립니다. 서약을 들으신 뒤 천천히 식사까지 함께해 주세요.',
    ],
    sectionStyle: 'outlined',
    sections: [
      {
        component: 'picture',
        title: '나무 그늘 아래 차린 식탁',
        image: '/images/showcase/garden-table.webp',
      },
      { component: 'greeting' },
      {
        component: 'timeline',
        title: '정원의 오후',
        items: [
          { time: '14:40', title: '나무 그늘에서 웰컴 티' },
          { time: '15:00', title: '꽃길 입장과 서약' },
          { time: '15:40', title: '정원 식탁으로 이동' },
        ],
      },
      { component: 'calendar', title: '가든 세리머니' },
      { component: 'place', title: '정원 입구' },
      {
        component: 'mealMenu',
        title: '정원의 식탁',
        subtitle: 'Garden Lunch',
        style: 'garden',
        courses: [
          { name: '첫 접시', dishes: ['허브를 곁들인 토마토'] },
          { name: '메인', dishes: ['레몬을 곁들인 구운 닭과 채소'] },
        ],
      },
      {
        component: 'wreath',
        title: '정원의 꽃으로 충분합니다',
        declineMessage:
          '꽃길을 따라 자란 꽃들로 예식장을 꾸몄습니다. 축하 화환은 정중히 사양합니다.',
      },
      {
        component: 'faq',
        title: '정원에 오시기 전에',
        items: [
          {
            question: '어떤 신발이 편할까요?',
            answer: '잔디 위를 걸어요. 굽이 낮고 바닥이 넓은 신발이 편합니다.',
          },
          {
            question: '비가 오면 어디로 가나요?',
            answer:
              '같은 건물 1층 실내홀에서 만나요. 정원 입구에서 안내해 드릴게요.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '식사가 끝나도 서두르지 마세요. 나무 그늘에서 한 분씩 뵙고 싶습니다.',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-4',
    name: '로맨틱 레터',
    description: '크림빛 종이 위에 정성껏 적어 내려간 초대의 편지.',
    palette: ['#FAF7F2', '#806353', '#51443D'],
    eyebrow: 'WITH ALL OUR LOVE',
    heading: '소중한 당신께',
    message: [
      '이 편지를 쓰며 가장 먼저 당신의 얼굴을 떠올렸습니다. 저희가 한 가족이 되는 날, 꼭 모시고 싶어요.',
    ],
    sectionStyle: 'paper',
    sections: [
      { component: 'greeting' },
      {
        component: 'picture',
        title: '봉투를 닫기 전에',
        image: '/images/showcase/love-letter.webp',
        caption: '말로는 쑥스러웠던 감사 인사도 함께 담았습니다.',
      },
      {
        component: 'interview',
        title: '처음 건넨 편지',
        question: '첫 편지에는 무슨 말을 썼나요?',
        answer:
          '아현이 감기에 걸렸을 때 민성이 죽 통에 쪽지를 붙였어요. 다 먹으면 냉장고에 귤도 있다는 말. 아직 서랍 안에 있어요.',
        image: '/images/showcase/vow-rings.webp',
      },
      { component: 'calendar', title: '편지에 적어 둔 날' },
      {
        component: 'notice',
        title: '답장을 남기는 자리',
        heading: '로비의 작은 우편함',
        message:
          '준비한 엽서에 이름과 축하 한 줄을 적어 넣어 주세요. 신혼집에 돌아가 천천히 읽겠습니다.',
        preset: 'time',
      },
      { component: 'place', title: '기다리고 있을 곳' },
      {
        component: 'mealMenu',
        title: '편지 곁의 찻상',
        subtitle: 'Tea & Sweets',
        style: 'classic',
        courses: [
          { name: '차', dishes: ['따뜻한 캐모마일'] },
          { name: '다과', dishes: ['레몬 마들렌과 버터 쿠키'] },
        ],
      },
      {
        component: 'wreath',
        title: '축하 화환 안내',
        declineMessage:
          '화환 대신 손글씨 한 줄을 부탁드려요. 두고두고 꺼내 읽을게요.',
      },
      {
        component: 'closingComment',
        message:
          '와 주시면 손을 잡고 직접 인사드릴게요. 사랑을 담아, 민성·아현 올림',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-5',
    name: '오거스트 에디토리얼',
    font: 'SUIT',
    description: '선명한 날짜와 여백이 만드는 현대적인 웨딩 에디토리얼.',
    palette: ['#FFFFFF', '#344E57', '#394348'],
    eyebrow: 'SAVE OUR DATE · 08.11',
    heading: '8월 11일을 비워 주세요',
    message: [
      '여름 한가운데서 저희가 결혼합니다. 가장 반가운 얼굴들과 그날을 함께하고 싶습니다.',
    ],
    sectionStyle: 'plain',
    sections: [
      { component: 'calendar', title: '8월의 약속', template: 'calendarType5' },
      { component: 'greeting' },
      {
        component: 'gallery',
        title: '8월호 화보',
        template: 'galleryType6',
        ratio: '3:4',
        images: [
          '/samples/wedding_14/images/03_2eb9460b-b5ed-470c-beff-a088f65983f9.jpg',
          '/samples/wedding_14/images/04_779358cc-330b-4bb4-818b-6b1c2e91958c.jpg',
          '/samples/wedding_14/images/05_b1c68d54-033d-4053-9dc6-f9b05cc6b9ef.jpg',
        ],
      },
      {
        component: 'interview',
        title: '한 문장 인터뷰',
        question: '함께 처음 맞는 여름, 무엇을 하고 싶나요?',
        answer:
          '수박 한 통을 사서 냉장고에 넣어 두고, 친구들이 들를 때마다 한 조각씩 내주고 싶어요.',
        image: '/images/showcase/vow-rings.webp',
      },
      {
        component: 'timeline',
        title: '오후의 프로그램',
        items: [
          { time: '14:40', title: '로비에서 인사' },
          { time: '15:00', title: '서약과 축가' },
          { time: '16:00', title: '리셉션' },
        ],
      },
      {
        component: 'mealMenu',
        title: '리셉션 메뉴',
        subtitle: 'August Issue',
        style: 'tasting',
        courses: [
          { name: '한입 요리', dishes: ['토마토와 바질 타르트'] },
          { name: '디저트', dishes: ['바닐라 아이스크림과 자두'] },
        ],
      },
      { component: 'place', title: '그랜드홀로 오시는 길' },
      {
        component: 'transportation',
        title: '차를 가져오실 분께',
        parkingHours: '예식 참석 차량은 두 시간 주차할 수 있습니다.',
        alternativeParking: '귀가 전 1층 로비에서 차량 번호를 등록해 주세요.',
      },
      {
        component: 'closingComment',
        message: '8월호의 마지막 사진은 여러분과 함께 찍겠습니다. 민성·아현',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-6',
    name: '콰이어트 프로미스',
    description: '절제된 흑백과 세리프에 담긴 조용하고 깊은 마음.',
    palette: ['#FBFBF9', '#373737', '#505050'],
    eyebrow: 'WE ARE GETTING MARRIED',
    heading: '조용히 건네는 약속',
    message: [
      '서로의 이야기를 끝까지 듣는 사람이 되겠습니다. 저희가 그 약속을 나누는 자리에 함께해 주세요.',
    ],
    sectionStyle: 'plain',
    sections: [
      {
        component: 'coupleIntroduction',
        title: '서약하는 두 사람',
        story:
          '먼저 일어난 사람이 물을 올리고, 늦게 오는 사람을 기다리는 저녁을 오래 지켜 가겠습니다.',
      },
      { component: 'greeting' },
      {
        component: 'picture',
        title: '서약을 쓰던 밤',
        image: '/images/showcase/love-letter.webp',
        caption:
          '한 문장씩 고쳐 쓰다가 둘 다 같은 말을 남겼습니다. 잘 듣고, 자주 웃자고요.',
      },
      { component: 'calendar', title: '예식 일시' },
      {
        component: 'wreath',
        title: '마음만 전해 주세요',
        declineMessage:
          '작은 예식이라 축하 화환은 사양합니다. 두 사람이 서약을 읽는 순간 함께 앉아 주시면 기쁘겠습니다.',
      },
      { component: 'place', title: '예식 장소' },
      {
        component: 'afterParty',
        title: '서약 뒤의 식탁',
        venue: '그랜드홀 옆 식사 공간',
        dateTime: '예식 후 오후 4시',
        description: '두 사람이 테이블을 돌며 직접 인사드리겠습니다.',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-7',
    name: '아워 서머 필름',
    font: '고운 바탕',
    description: '초록 언덕과 파란 하늘, 한 편의 여름 영화 같은 날.',
    palette: ['#EFF5F2', '#426A64', '#344D46'],
    eyebrow: 'OUR SUMMER, OUR FOREVER',
    heading: '우리 여름의 다음 장면',
    message: [
      '들판에서 해가 질 때까지 걷던 여름을 기억합니다. 다음 장면에는 여러분도 함께였으면 좋겠습니다.',
    ],
    sectionStyle: 'plain',
    sections: [
      {
        component: 'gallery',
        title: '여름 필름, 세 컷',
        template: 'galleryType7',
        ratio: '3:4',
        images: [
          '/samples/wedding_14/images/03_2eb9460b-b5ed-470c-beff-a088f65983f9.jpg',
          '/samples/wedding_14/images/04_779358cc-330b-4bb4-818b-6b1c2e91958c.jpg',
          '/samples/wedding_14/images/06_b2cf8c86-2b11-4f18-b2de-bfc8fa5c08f4.jpg',
        ],
      },
      { component: 'greeting' },
      {
        component: 'interview',
        title: '사진 밖의 이야기',
        question: '세 컷 중 가장 오래 기다린 장면은요?',
        answer:
          '언덕 위에 해가 걸린 순간이요. 자리를 잡고 기다리다가 둘 다 풀밭에 누워 버렸어요.',
        image: '/images/showcase/love-letter.webp',
      },
      { component: 'calendar', title: '상영일처럼 기다린 날' },
      {
        component: 'timeline',
        title: '그날의 세 장면',
        items: [
          { time: '14:40', title: '로비에서 인사' },
          { time: '15:00', title: '두 사람의 입장' },
          { time: '15:45', title: '엔딩 크레디트 대신 단체 사진' },
        ],
      },
      { component: 'place', title: '예식이 열리는 곳' },
      {
        component: 'notice',
        title: '예식 뒤 포토 타임',
        heading: '사진에 함께해 주세요',
        message:
          '서약을 마친 뒤 홀 앞에서 한 장씩 찍을게요. 휴대폰 카메라도 환영합니다.',
        preset: 'shooting',
      },
      {
        component: 'afterParty',
        title: '촬영이 끝나면',
        venue: '그랜드홀 연회장',
        dateTime: '단체 사진을 찍은 뒤',
        description:
          '같은 테이블에 둘러앉아 방금 찍은 사진들을 같이 보려고 합니다.',
      },
      {
        component: 'closingComment',
        message: '우리의 여름 영화에 얼굴을 빌려 주셔서 고맙습니다. 민성·아현',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-8',
    name: '앰버 시티',
    font: 'SUIT',
    description: '도시의 깊은 색과 앰버 포인트로 완성한 시크한 초대.',
    palette: ['#F6F2EB', '#95622D', '#494037'],
    eyebrow: 'LOVE IN THE CITY',
    heading: '도시 한가운데서 만나요',
    message: [
      '한낮의 예식이 끝나면 잔을 들고 조금 더 함께하고 싶습니다. 두 자리 모두 편히 들러 주세요.',
    ],
    sectionStyle: 'outlined',
    sections: [
      { component: 'greeting' },
      {
        component: 'coupleIntroduction',
        title: '도시에서 만난 두 사람',
        story:
          '퇴근 시간이 자주 겹쳐 같은 골목을 걸었습니다. 어느 날부터는 먼저 도착한 쪽이 가로등 아래서 기다렸어요.',
      },
      {
        component: 'afterParty',
        title: '예식 뒤의 건배',
        venue: '그랜드홀 옆 라운지',
        dateTime: '예식 후 오후 4시',
        description:
          '앰버빛 라운지에서 웰컴 드링크와 작은 접시 요리를 나눕니다.',
      },
      {
        component: 'mealMenu',
        title: '라운지의 첫 잔',
        subtitle: 'Amber Hour',
        style: 'artDeco',
        courses: [
          {
            name: '잔을 들 때',
            dishes: ['오렌지 진저 에이드', '시트러스 하이볼'],
          },
          { name: '함께 먹을 것', dishes: ['치즈와 올리브 꼬치'] },
        ],
      },
      { component: 'calendar', title: '예식 시작' },
      { component: 'place', title: '예식과 리셉션' },
      {
        component: 'dressCode',
        title: '라운지의 색',
        colors: ['#945B32', '#C59D73', '#323238'],
        guidelines: [
          '사진에 따뜻한 색을 담고 싶은 분은 브라운 포인트를 더해 주세요. 예식 때 입은 옷 그대로 오셔도 좋아요.',
        ],
      },
      {
        component: 'transportation',
        title: '지하철로 오시면',
        subwayStation: '강남역',
        subwayExit: '11번 출구',
        subwayWalk:
          '출구에서 테헤란로1길로 들어오세요. 로비에서 그랜드홀로 안내해 드립니다.',
      },
      {
        component: 'closingComment',
        message: '해 질 무렵 라운지에서 한 번 더 인사드릴게요. 민성·아현',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-9',
    name: '위켄드 인 러브',
    font: 'SUIT',
    description: '산책처럼 편안하고, 여행처럼 설레는 우리의 초대.',
    palette: ['#FFFFFF', '#5B7059', '#3E483C'],
    eyebrow: 'A WALK TO REMEMBER',
    heading: '우리랑 조금 걸을래요?',
    message: [
      '함께 걷다 보면 늘 길이 짧게 느껴졌어요. 이번에는 식이 끝나고 여러분과도 느긋하게 걷고 싶습니다.',
    ],
    sectionStyle: 'plain',
    sections: [
      {
        component: 'interview',
        title: '둘이 가장 좋아하는 데이트',
        question: '둘이 자주 가는 곳이 있나요?',
        answer:
          '토요일 아침이면 집 앞 빵집까지 걸어요. 돌아오는 길에는 빵이 꼭 하나씩 줄어 있어요.',
        image:
          '/samples/wedding_14/images/06_b2cf8c86-2b11-4f18-b2de-bfc8fa5c08f4.jpg',
      },
      { component: 'greeting' },
      {
        component: 'gallery',
        title: '산책하다 멈춘 자리',
        template: 'galleryType7',
        ratio: '4:3',
        images: [
          '/samples/wedding_14/images/03_2eb9460b-b5ed-470c-beff-a088f65983f9.jpg',
          '/samples/wedding_14/images/05_b1c68d54-033d-4053-9dc6-f9b05cc6b9ef.jpg',
        ],
      },
      { component: 'calendar', title: '우리의 만남' },
      {
        component: 'mealMenu',
        title: '한 바퀴 걷기 전의 식사',
        subtitle: 'Weekend Lunch',
        style: 'bistro',
        courses: [
          { name: '따뜻한 접시', dishes: ['허브 치킨과 구운 감자'] },
          { name: '후식', dishes: ['레몬 케이크'] },
        ],
      },
      { component: 'place', title: '산책의 출발점' },
      {
        component: 'afterParty',
        title: '식후에 가볍게 한 바퀴',
        venue: '웨딩홀 앞마당',
        dateTime: '식사 후',
        description: '시간 되시는 분들과 앞마당을 걸으며 인사 나눌게요.',
      },
      {
        component: 'faq',
        title: '함께 걸으실 분께',
        items: [
          {
            question: '산책은 얼마나 걸리나요?',
            answer:
              '앞마당을 천천히 돌아오는 10분 코스예요. 중간 벤치에서 기다리셔도 좋습니다.',
          },
        ],
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-10',
    name: '러브 온 더 스트리트',
    date: '2026-03-03',
    font: 'SUIT',
    description: '자유로운 레드 레터링처럼, 우리다운 경쾌한 시작.',
    palette: ['#FFFCF8', '#C8463D', '#413A35'],
    eyebrow: 'LOVE, JUST THE WAY WE ARE',
    heading: '거리에서처럼 편하게',
    message: [
      '특별한 날에도 우리답게 웃고 싶어요. 좋아하는 차림으로 와서 함께 건배해 주세요.',
    ],
    sectionStyle: 'rounded',
    sections: [
      {
        component: 'dressCode',
        title: '오늘의 포인트 컬러',
        colors: ['#B52A36', '#E89A98', '#263335'],
        guidelines: [
          '운동화도 좋아요. 빨간 양말이나 작은 액세서리 하나면 충분해요.',
        ],
      },
      { component: 'greeting' },
      {
        component: 'interview',
        title: '민성과 아현에게 한 질문',
        question: '입장할 때 꼭 하고 싶은 일이 있나요?',
        answer:
          '눈이 마주치는 친구에게 손을 흔들기로 했어요. 앞자리든 뒷자리든 우리를 보면 먼저 흔들어 주세요.',
        image:
          '/samples/wedding_14/images/06_b2cf8c86-2b11-4f18-b2de-bfc8fa5c08f4.jpg',
      },
      { component: 'calendar', title: '우리가 결혼하는 날' },
      {
        component: 'timeline',
        title: '오늘의 순서',
        items: [
          { time: '14:40', title: '로비에서 하이파이브' },
          { time: '15:00', title: '커플 입장' },
          { time: '15:40', title: '친구들과 단체 사진' },
        ],
      },
      { component: 'place', title: '함께 모일 홀' },
      {
        component: 'afterParty',
        title: '서약 뒤의 작은 파티',
        venue: '웨딩홀 라운지',
        dateTime: '오후 4시부터',
        description:
          '음악을 들으며 첫 잔을 나눠요. 무알코올 음료도 준비합니다.',
      },
      {
        component: 'mealMenu',
        title: '건배 옆에 놓을 핑거푸드',
        subtitle: 'Street Bites',
        style: 'bistro',
        courses: [
          { name: '짭짤하게', dishes: ['미니 버거와 감자튀김'] },
          { name: '달콤하게', dishes: ['딸기 한입 타르트'] },
        ],
      },
      {
        component: 'notice',
        title: '우리의 포토월',
        heading: '빨간 글씨 앞에서 한 컷',
        message:
          '라운지 입구에 작은 포토월을 세워 둘게요. 두 사람 이름 옆에 서서 마음껏 찍어 주세요.',
        preset: 'shooting',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-11',
    name: '포레스트 서약',
    venue: '인비아 포레스트 · 가든홀',
    description: '짙은 숲의 고요함과 따뜻한 빛을 담은 서정적인 웨딩.',
    palette: ['#F4F3EB', '#4F5C42', '#444B3B'],
    eyebrow: 'ROOTED IN LOVE',
    heading: '나무 아래서 나누는 서약',
    message: [
      '숲길을 걷다 서로의 곁이 가장 편안하다는 걸 알았습니다. 그 길의 첫 하객이 되어 주세요.',
    ],
    sectionStyle: 'paper',
    sections: [
      { component: 'greeting' },
      {
        component: 'coupleIntroduction',
        title: '함께 뿌리내릴 두 사람',
        story:
          '계절이 바뀌면 같은 나무를 보러 가요. 오래 곁에 서 있는 마음을 배우는 중입니다.',
      },
      {
        component: 'picture',
        title: '숲에서 고른 한 장',
        image:
          '/samples/wedding_14/images/03_2eb9460b-b5ed-470c-beff-a088f65983f9.jpg',
        caption: '나란히 걷다가 뒤를 돌아본 순간을 남겼습니다.',
      },
      { component: 'calendar', title: '서약의 오후' },
      { component: 'place', title: '가든홀 입구' },
      {
        component: 'faq',
        title: '숲길을 걸으실 때',
        items: [
          {
            question: '유모차로도 들어갈 수 있나요?',
            answer:
              '정문 오른쪽의 포장된 길을 이용해 주세요. 같은 가든홀 입구까지 이어집니다.',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '숲에서 나누는 식사',
        subtitle: 'Forest Table',
        style: 'ivy',
        courses: [
          { name: '따뜻한 접시', dishes: ['버섯 수프와 구운 빵'] },
          { name: '마지막 한 입', dishes: ['배와 꿀을 곁들인 타르트'] },
        ],
      },
      {
        component: 'wreath',
        title: '꽃 대신 건네실 인사',
        declineMessage:
          '가든홀 주변의 나무와 풀꽃을 그대로 두고 싶습니다. 화환은 정중히 사양합니다.',
      },
    ],
  },
  {
    ...seminar,
    id: 'showcase-12',
    name: '볼드 비즈니스',
    description: '큰 질문과 선명한 인사이트를 담은 대담한 컨퍼런스.',
    palette: ['#F2F6FF', '#245BC6', '#253C5E'],
    eyebrow: 'ANNUAL BUSINESS CONFERENCE 2026',
    heading: '올해의 비즈니스 컨퍼런스에 초대합니다',
    message: [
      'Andrew Jackson과 시장 변화에 대응한 팀들의 선택을 살펴봅니다. 오후 강연과 네트워킹에 함께해 주세요.',
    ],
    sectionStyle: 'plain',
    sections: [
      {
        component: 'timeline',
        title: '컨퍼런스 프로그램',
        items: [
          { time: '14:30', title: '등록 및 자료 수령' },
          {
            time: '15:00',
            title: '기조 강연',
            description: '시장이 바뀔 때 무엇을 먼저 바꿀까',
          },
          { time: '16:00', title: '네트워킹' },
        ],
      },
      {
        component: 'speakerInformation',
        title: '기조 강연자',
        name: 'Andrew Jackson',
        bio: '시장 신호를 읽고 팀의 우선순위를 다시 정했던 두 사례를 비교합니다. 어느 시점에 결정을 내렸는지 들어보세요.',
        image: '/images/showcase/conference-speaker.webp',
      },
      { component: 'greeting' },
      {
        component: 'notice',
        title: '입장 데스크',
        heading: '이름표와 프로그램 수령',
        message:
          '오후 2시 30분부터 로비에서 이름표를 드립니다. 뒷면에는 세션 순서와 네트워킹 장소가 적혀 있습니다.',
        preset: 'time',
      },
      { component: 'calendar', title: '컨퍼런스 일시' },
      { component: 'place', title: '메인 오디토리움' },
      {
        component: 'faq',
        title: '발표를 들으며',
        items: [
          {
            question: '질문은 어디에 남기나요?',
            answer:
              '좌석에 놓인 카드에 적어 주세요. 진행자가 강연 마지막에 모아서 연사에게 전합니다.',
          },
        ],
      },
      {
        component: 'sponsorshipInfomation',
        title: '행사를 함께 준비한 파트너',
        images: [
          '/samples/seminar_01/images/01_chatgpt_image_2026년_8월_12일_오후_07_36_16_1_1.png',
          '/samples/seminar_01/images/04_chatgpt_image_2026년_8월_12일_오후_07_36_17_4_1.png',
        ],
      },
      {
        component: 'closingComment',
        message:
          '돌아가서 시도해 보고 싶은 아이디어 하나를 가져가시길 바랍니다. 컨퍼런스 운영팀',
      },
    ],
  },
  {
    ...seminar,
    id: 'showcase-13',
    name: '블루 호라이즌',
    description: '푸른 그라데이션처럼 넓어지는 생각과 연결의 가능성.',
    palette: ['#F2F6FC', '#345BC5', '#354566'],
    eyebrow: 'NEW PERSPECTIVES, NEW POSSIBILITIES',
    heading: '강연이 끝나면 옆 사람과 이야기를 나눕니다',
    message: [
      'Andrew Jackson의 발표에서 떠오른 질문을 가져오세요. 다른 팀에서 일하는 분들과 생각을 나눌 자리를 마련했습니다.',
    ],
    sectionStyle: 'rounded',
    sections: [
      { component: 'greeting' },
      {
        component: 'speakerInformation',
        title: '테이블 대화의 첫 질문',
        name: 'Andrew Jackson',
        bio: '업계가 다른 두 팀이 같은 문제를 푼 사례를 소개합니다. 강연이 끝나면 여러분의 선택도 궁금합니다.',
        image: '/images/showcase/conference-speaker.webp',
      },
      { component: 'calendar', title: '포럼 일시' },
      {
        component: 'timeline',
        title: '포럼의 흐름',
        items: [
          { time: '14:40', title: '등록과 테이블 주제 확인' },
          { time: '15:00', title: '강연과 질의응답' },
          { time: '16:00', title: '라운지 대화' },
        ],
      },
      {
        component: 'afterParty',
        title: '자리를 옮겨 나누는 대화',
        venue: '오디토리움 앞 라운지',
        dateTime: '강연이 끝나는 오후 4시부터',
        description:
          '테이블마다 한 가지 화두를 놓습니다. 관심 있는 자리로 자유롭게 옮겨 주세요.',
      },
      {
        component: 'faq',
        title: '처음 오시는 분께',
        items: [
          {
            question: '혼자 와도 대화에 참여할 수 있나요?',
            answer:
              '입구에서 관심 있는 주제를 골라 주세요. 테이블 진행자가 첫 인사를 도와드립니다.',
          },
        ],
      },
      { component: 'place', title: '강연장과 라운지' },
      {
        component: 'mealMenu',
        title: '라운지 음료',
        subtitle: 'Networking Break',
        style: 'minimal',
        courses: [
          { name: '차가운 음료', dishes: ['레몬 탄산수'] },
          { name: '따뜻한 음료', dishes: ['드립커피와 루이보스 티'] },
        ],
      },
      {
        component: 'organizerInformation',
        title: '모임을 여는 팀',
        organizer: 'NextGrowth',
        message:
          '서로 다른 업계의 실무자가 한 테이블에 앉는 자리를 기획합니다.',
        image: '/samples/seminar_01/images/09_주최사.png',
      },
    ],
  },
  {
    ...seminar,
    id: 'showcase-14',
    name: '오렌지 스파크',
    description: '따뜻한 에너지로 아이디어에 불을 켜는 크리에이티브 세션.',
    palette: ['#FFF6EA', '#A85223', '#5D402B'],
    eyebrow: 'IDEAS INTO ACTION',
    heading: '아이디어 하나를 가져가세요',
    message: [
      'Andrew Jackson과 함께 아이디어를 종이에 그리고, 짝과 바꿔 보며 한 번 더 다듬습니다. 스케치를 처음 해보는 분도 환영합니다.',
    ],
    sectionStyle: 'outlined',
    sections: [
      {
        component: 'timeline',
        title: '아이디어 워크숍',
        items: [
          {
            time: '15:00',
            title: '관찰하기',
            description: '요즘 일하면서 자주 마주친 불편을 씁니다.',
          },
          {
            time: '15:20',
            title: '그려 보기',
            description: '한 가지 해결책을 종이에 담습니다.',
          },
          { time: '15:45', title: '짝과 바꿔 읽기' },
        ],
      },
      { component: 'greeting' },
      {
        component: 'speakerInformation',
        title: '함께 스케치할 진행자',
        name: 'Andrew Jackson',
        bio: 'Andrew Jackson이 관찰한 불편 하나를 그림으로 바꾸는 과정을 먼저 보여 드립니다. 그다음은 각자 가져온 사례를 펼칠 차례입니다.',
        image: '/images/showcase/conference-speaker.webp',
      },
      {
        component: 'notice',
        title: '워크숍 준비물',
        heading: '필기구 한 자루',
        message:
          '평소 쓰는 펜을 가져와 주세요. 스케치할 종이는 현장에서 나눠 드립니다.',
        preset: 'time',
        image: '/images/showcase/conference-hall.webp',
      },
      {
        component: 'faq',
        title: '워크숍이 끝날 때',
        items: [
          {
            question: '내 스케치는 가져갈 수 있나요?',
            answer:
              '네. 짝이 남긴 메모와 스케치를 함께 챙겨 가세요. 다른 분의 작업을 촬영할 때는 먼저 동의를 구해 주세요.',
          },
        ],
      },
      { component: 'calendar', title: '워크숍 일시' },
      { component: 'place', title: '워크숍 장소' },
      {
        component: 'afterParty',
        title: '작업을 둘러보는 시간',
        venue: '오디토리움 앞 로비',
        dateTime: '워크숍이 끝나는 오후 4시부터',
        description:
          '벽에 붙인 스케치를 둘러보고, 만든 분께 직접 질문을 건네 보세요. 전시는 자유롭게 참여하실 수 있습니다.',
      },
      {
        component: 'closingComment',
        message:
          '완성한 스케치에 다음에 해 볼 실험 하나를 적어 두세요. 그 한 줄까지가 오늘의 작업입니다.',
      },
    ],
  },
  {
    ...seminar,
    id: 'showcase-15',
    name: '레드 임팩트',
    description: '강렬한 레드와 명확한 메시지로 전하는 새로운 움직임.',
    palette: ['#FFF4F2', '#B63335', '#563A3B'],
    eyebrow: 'MAKE YOUR NEXT MOVE',
    heading: '리더의 결정을 묻습니다',
    message: [
      '이번에는 청중의 질문에도 마이크를 엽니다. 지금 팀에서 풀고 싶은 문제를 한 가지 떠올려 오세요.',
    ],
    sectionStyle: 'plain',
    sections: [
      {
        component: 'speakerInformation',
        title: '무대에 오르는 연사',
        name: 'Andrew Jackson',
        bio: '전략을 실행에 옮길 때 리더가 마주하는 선택을 다룹니다. 발표 후에는 청중의 사례를 함께 살펴봅니다.',
        image: '/images/showcase/conference-speaker.webp',
      },
      {
        component: 'timeline',
        title: '마이크가 넘어가는 순서',
        items: [
          { time: '15:00', title: '기조 발표' },
          { time: '15:35', title: '좌석에서 질문 정리' },
          { time: '15:40', title: '객석 마이크 개방' },
        ],
      },
      { component: 'greeting' },
      { component: 'calendar', title: '강연 일시' },
      {
        component: 'picture',
        title: '질문이 시작되는 객석',
        image: '/images/showcase/conference-hall.webp',
        caption:
          '질문하실 때는 자리에 앉아 손을 들어 주세요. 진행자가 마이크를 가져갑니다.',
      },
      { component: 'place', title: '강연장' },
      {
        component: 'faq',
        title: '라이브 질의응답',
        items: [
          {
            question: '질문은 언제 받나요?',
            answer:
              '발표 뒤에 객석 마이크를 돌립니다. 손을 들어 주시면 진행자가 찾아갑니다.',
          },
          {
            question: '질문을 미리 준비해야 하나요?',
            answer:
              '현장에서 떠오른 질문도 좋습니다. 한 분씩 말씀하실 수 있게 하나씩 부탁드립니다.',
          },
        ],
      },
      {
        component: 'organizerInformation',
        title: '질의응답을 진행하는 팀',
        organizer: 'NextGrowth',
        message:
          '객석 마이크와 발언 순서를 맡습니다. 말로 묻기 어려운 분은 입장 때 질문 카드를 받아 주세요.',
        image: '/samples/seminar_01/images/09_주최사.png',
      },
    ],
  },
  {
    ...seminar,
    id: 'showcase-16',
    name: '웜 인사이트',
    description: '차분한 공간에서 깊이 나누는, 사람 중심의 비즈니스 대화.',
    palette: ['#F8F4EC', '#7B654B', '#50473B'],
    eyebrow: 'THOUGHTFUL CONVERSATIONS',
    heading: '커피 한 잔 놓고 이야기해요',
    message: [
      '따뜻한 커피와 작은 테이블을 준비했습니다. Andrew Jackson이 일을 하며 만난 사람들, 그리고 그들에게서 배운 이야기를 들려드립니다.',
    ],
    sectionStyle: 'paper',
    sections: [
      { component: 'greeting' },
      {
        component: 'speakerInformation',
        title: '오늘의 대화 상대',
        name: 'Andrew Jackson',
        bio: '팀의 의견이 갈리던 날 한 동료가 건넨 질문에서 이야기를 시작합니다. 여러분이 기억하는 한마디도 들려주세요.',
        image: '/images/showcase/conference-speaker.webp',
      },
      {
        component: 'place',
        title: '대화를 나눌 공간',
        detail: '입구에서 커피를 받아 편한 자리에 앉아 주세요.',
      },
      { component: 'calendar', title: '오후의 만남' },
      {
        component: 'closingComment',
        message: '조금 일찍 오셔도 좋아요. 따뜻한 잔을 준비해 두겠습니다.',
      },
    ],
  },
  {
    ...birthday,
    id: 'showcase-17',
    name: '치어스 투 27',
    description: '가볍게 잔을 부딪치며 시작하는 스물일곱의 새로운 장.',
    palette: ['#FFFAF1', '#96702E', '#51462E'],
    eyebrow: 'CHEERS TO TWENTY-SEVEN',
    heading: '첫 잔은 같이 들어요',
    message: [
      '스물일곱 생일에는 다 같이 모여 잔 부딪치는 소리를 듣고 싶어요. 빈손으로 와 주세요. 민혁 드림',
    ],
    sectionStyle: 'plain',
    sections: [
      { component: 'greeting' },
      {
        component: 'mealMenu',
        title: '첫 잔을 골라 주세요',
        subtitle: 'Birthday Drinks',
        style: 'bistro',
        courses: [
          {
            name: '건배할 때',
            dishes: ['시트러스 스프리츠', '무알코올 자몽 소다'],
          },
          { name: '곁들임', dishes: ['올리브와 치즈'] },
        ],
      },
      { component: 'calendar', title: '건배하는 시간' },
      { component: 'place', title: '예약해 둔 테이블' },
    ],
  },
  {
    ...birthday,
    id: 'showcase-18',
    name: '마이 데이 포토',
    time: '15:00',
    description: '꾸밈없는 사진 한 장처럼, 편안하고 솔직한 생일 초대.',
    palette: ['#FBF6F0', '#8A5C3B', '#4F4135'],
    eyebrow: '27TH BIRTHDAY · FOR MINHYUK',
    heading: '휴대폰 속 사진 한 장만 골라 와',
    message: [
      '작년 생일 사진을 넘겨 보다가 다들 보고 싶어졌어. 같이 찍은 사진 하나씩 골라 와. 케이크 먹으면서 그날 얘기도 듣고 싶어.',
    ],
    sectionStyle: 'paper',
    sections: [
      { component: 'greeting' },
      {
        component: 'gallery',
        title: '작년 생일에 남긴 두 컷',
        images: [
          '/images/showcase/birthday-table.webp',
          '/images/showcase/birthday-evening.webp',
        ],
        template: 'galleryType5',
        ratio: '4:3',
      },
      { component: 'calendar', title: '사진 찍는 날' },
      { component: 'place', title: '모일 곳' },
      {
        component: 'closingComment',
        message: '이번 사진에도 네 자리가 있었으면 좋겠어. 민혁이가',
      },
    ],
  },
  {
    ...birthday,
    id: 'showcase-19',
    name: '핑크 케이크 클럽',
    font: 'LINESeedKR',
    description: '딸기 우유빛 핑크와 케이크처럼 달콤한 생일 파티.',
    palette: ['#FFF1F4', '#AD526E', '#68434E'],
    eyebrow: 'A LITTLE CAKE, A LOT OF LOVE',
    heading: '케이크 자를 때 같이 있어 줘',
    message: [
      '딸기를 얹고 초를 꽂으면 우리 생일상이 완성돼요. 차 한 잔씩 들고 천천히 놀다 가세요.',
    ],
    sectionStyle: 'rounded',
    sections: [
      {
        component: 'mealMenu',
        title: '오늘의 케이크와 차',
        subtitle: 'Cake & Tea',
        style: 'ribbon',
        courses: [
          { name: '케이크', dishes: ['딸기 생크림 케이크'] },
          { name: '차', dishes: ['따뜻한 얼그레이', '아이스 베리 티'] },
        ],
      },
      { component: 'greeting' },
      {
        component: 'dressCode',
        title: '작은 핑크 포인트',
        colors: ['#EEA9BD', '#C95775', '#FFF0E4'],
        guidelines: [
          '양말이나 머리핀에 분홍색 한 점이면 충분해요. 편한 차림도 환영해요.',
        ],
      },
      { component: 'calendar', title: '티 파티 시간' },
      { component: 'place', title: '우리의 케이크 테이블' },
    ],
  },
  {
    ...birthday,
    id: 'showcase-20',
    name: '트웬티 세븐 클럽',
    description: '커다란 숫자처럼 크게 웃고 싶은 스물일곱의 파티.',
    palette: ['#FFF5F7', '#9F4968', '#473A41'],
    eyebrow: 'INVITE YOU · TWENTY SEVEN',
    heading: '스물일곱의 플레이리스트',
    message: [
      '올해는 축하 노래 뒤에 너희가 고른 곡을 듣고 싶어. 요즘 자주 듣는 한 곡의 제목을 기억해 와!',
    ],
    sectionStyle: 'plain',
    sections: [
      {
        component: 'calendar',
        title: '27번째 생일 파티',
        template: 'calendarType4',
      },
      { component: 'greeting' },
      { component: 'place', title: '오늘의 클럽하우스' },
      {
        component: 'timeline',
        title: '오후의 플레이리스트',
        items: [
          { time: '15:00', title: '체크인과 신청곡 받기' },
          { time: '15:30', title: '생일 노래와 촛불' },
          { time: '16:00', title: '친구들이 고른 곡 듣기' },
        ],
      },
    ],
  },
  {
    ...firstBirthday,
    id: 'showcase-21',
    name: '리틀 파티 북',
    description: '오려 붙인 추억과 작은 고깔모자, 사랑으로 채운 첫 생일.',
    palette: ['#FAF5E9', '#8C6845', '#55483A'],
    eyebrow: 'OUR LITTLE ONE TURNS ONE',
    heading: '민준이의 첫해를 펼쳐 봅니다',
    message: [
      '첫 장을 열 때만 해도 품에 쏙 들어왔는데, 벌써 제 손으로 책장을 넘깁니다. 민준이의 첫 생일을 함께 축하해 주세요.',
    ],
    sectionStyle: 'paper',
    sections: [
      {
        component: 'timeline',
        title: '민준이의 성장 수첩',
        items: [
          { time: '첫날', title: '손가락을 꼭 쥐었어요' },
          { time: '백일', title: '눈을 맞추고 소리 내어 웃었어요' },
          { time: '첫돌', title: '생일 노래에 맞춰 짝짜꿍해요' },
        ],
      },
      { component: 'greeting' },
      {
        component: 'myFamily',
        title: '초대장을 보낸 우리 가족',
        members: [
          { relation: '엄마', name: '지수' },
          { relation: '아빠', name: '준호' },
        ],
        message:
          '함께 지켜봐 주신 덕분에 첫해를 잘 보냈습니다. 돌상 앞에서 반갑게 인사드릴게요.',
      },
      {
        component: 'calendar',
        title: '첫돌 잔칫날',
        template: 'calendarType3',
      },
      {
        component: 'place',
        title: '가족이 모이는 곳',
        detail: '유아 의자와 잠시 쉬어 갈 가족 휴식 공간이 있습니다.',
      },
    ],
  },
  {
    ...firstBirthday,
    id: 'showcase-22',
    name: '민준이의 첫 초대',
    font: 'LINESeedKR',
    description: '파란 고깔모자와 작은 미소로 전하는 사랑스러운 첫 초대장.',
    palette: ['#F3F7FF', '#47629A', '#3D4B66'],
    eyebrow: 'MINJUN’S FIRST BIRTHDAY',
    heading: '제 생일에 놀러 오세요',
    message: [
      '엄마 아빠가 제 이름으로 초대장을 써 주셨어요. 첫 촛불을 불 때 제 옆에 있어 주세요.',
    ],
    sectionStyle: 'rounded',
    sections: [
      { component: 'greeting' },
      { component: 'calendar', title: '첫 번째 생일' },
      {
        component: 'myChild',
        title: '한 살 민준이의 요즘',
        name: '민준',
        birthday: '2025. 08. 11',
        message:
          '누가 손뼉을 치면 저도 두 손을 마주쳐요. 요즘 제일 신나는 놀이예요.',
        image: '/templates/thumbnails/firstBirthday_02.png',
      },
      { component: 'place', title: '돌상이 있는 곳' },
      {
        component: 'notice',
        title: '돌잡이 사진',
        heading: '플래시는 잠깐 꺼 주세요',
        message:
          '민준이가 무엇을 고를지 천천히 지켜봐 주세요. 돌잡이가 끝나면 함께 사진 찍을 시간도 있어요.',
        preset: 'shooting',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-23',
    name: '알파인 프로미스',
    font: 'Noto Serif KR',
    date: '2026-03-03',
    venue: '인비아 알파인 · 마운틴홀',
    description: '산 능선과 맑은 공기, 함께 걷는 약속을 담은 웨딩 초대장.',
    palette: ['#F2F3EF', '#657465', '#414842'],
    eyebrow: 'A PROMISE ABOVE THE CITY',
    heading: '함께 걷기로 한 날',
    message: [
      '산길을 걸을 때면 먼저 간 사람이 돌아서서 기다렸습니다. 앞으로도 그렇게 서로의 보폭을 맞추겠습니다.',
    ],
    sectionStyle: 'outlined',
    sections: [
      { component: 'greeting' },
      { component: 'place', title: '마운틴홀에서 만나요' },
      {
        component: 'calendar',
        title: '서약하는 날',
        template: 'calendarType1',
      },
      {
        component: 'transportation',
        title: '홀까지 오시는 길',
        shuttleStop: '건물 정문 앞 승차장에서 마운틴홀 입구까지 운행합니다.',
        shuttleInterval: '예식 시작 한 시간 전부터 15분 간격',
      },
      {
        component: 'closingComment',
        message: '먼 길 와 주시는 마음을 오래 기억하겠습니다. 민성 · 아현',
      },
    ],
  },
  {
    ...wedding,
    id: 'showcase-24',
    name: '브릭 시티 웨딩',
    font: 'Pretendard',
    date: '2026-08-08',
    venue: '인비아 시티홀 · 브릭 라운지',
    description: '붉은 벽돌 골목과 평범한 하루를 담은 도시의 웨딩 에디토리얼.',
    palette: ['#F5F1E9', '#A65D43', '#463C36'],
    eyebrow: 'OUR CITY, OUR STORY',
    heading: '우리 동네에 초대합니다',
    message: [
      '자주 걷던 골목에 둘이 마음에 둔 장소가 있습니다. 붉은 벽돌 건물에서 저희의 다음 이야기를 시작합니다.',
    ],
    sectionStyle: 'plain',
    sections: [
      {
        component: 'place',
        title: '벽돌 골목의 브릭 라운지',
        detail: '붉은 벽돌 건물의 라운지 입구에서 맞이할게요.',
      },
      { component: 'greeting' },
      {
        component: 'coupleIntroduction',
        title: '이 골목을 고른 이유',
        story:
          '처음 함께 밥을 먹은 곳도, 집에 가기 아쉬워 한 바퀴 더 돈 곳도 이 근처였어요.',
      },
      { component: 'calendar', title: '라운지에서 만나는 날' },
      {
        component: 'transportation',
        title: '강남역에서 걸어오실 때',
        subwayStation: '강남역',
        subwayExit: '11번 출구',
        subwayWalk:
          '11번 출구에서 테헤란로1길을 따라오세요. 브릭 라운지 입구에서 식장으로 안내해 드립니다.',
      },
    ],
  },
];

export function getShowcaseInvitation(id: string) {
  return SHOWCASE_INVITATIONS.find(invitation => invitation.id === id);
}
