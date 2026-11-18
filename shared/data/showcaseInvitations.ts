import type { SectionStyle } from './sectionStyles';
import type { ShowcaseSection } from './showcaseSections';
import type { InvitationType } from '@/shared/types/block';

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
  sections?: ShowcaseSection[];
  sectionStyle?: SectionStyle;
  moments: [string, string, string];
  note: string;
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
      { component: 'place', title: '예식장 안내' },
    ],
    moments: ['반가운 인사', '새로운 시작', '축하의 만찬'],
    note: '예식 30분 전부터 여유롭게 입장하실 수 있습니다. 따뜻한 축하의 마음만 가져와 주세요.',
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
      { component: 'calendar', title: '3월의 예식' },
      { component: 'place', title: '만나는 곳' },
      {
        component: 'closingComment',
        message:
          '사진 속 빈자리에는 그날의 여러분을 모시고 싶습니다. 민성 · 아현',
      },
    ],
    moments: ['함께 모이는 시간', '우리의 약속', '사진과 식사'],
    note: '단정하고 편안한 차림으로 와 주세요. 예식 후 함께 사진을 남기고 싶습니다.',
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
      { component: 'place', title: '예식이 열리는 곳' },
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
    ],
    moments: ['설레는 만남', '하나가 되는 순간', '마음을 나누는 식사'],
    note: '봄바람이 불 수 있으니 가벼운 겉옷을 준비해 주세요. 예식은 실내에서 진행됩니다.',
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
    ],
    moments: ['가든 웰컴', '햇살 아래의 서약', '가든 디너'],
    note: '잔디 위를 편안하게 걸을 수 있는 신발을 추천합니다. 우천 시 같은 장소의 실내홀로 안내해 드립니다.',
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
      { component: 'calendar', title: '편지에 적어 둔 날' },
      { component: 'place', title: '기다리고 있을 곳' },
      {
        component: 'closingComment',
        message:
          '와 주시면 손을 잡고 직접 인사드릴게요. 사랑을 담아, 민성·아현 올림',
      },
    ],
    moments: ['환영의 인사', '사랑의 서약', '감사의 식사'],
    note: '예식 전 신부대기실에서 인사 나눌 수 있습니다. 일찍 오신 분들을 위한 웰컴 티를 준비했습니다.',
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
        component: 'timeline',
        title: '오후의 프로그램',
        items: [
          { time: '14:40', title: '로비에서 인사' },
          { time: '15:00', title: '서약과 축가' },
          { time: '16:00', title: '리셉션' },
        ],
      },
      { component: 'place', title: '그랜드홀로 오시는 길' },
    ],
    moments: ['웰컴 리셉션', '웨딩 세리머니', '디너 리셉션'],
    note: '예식은 오후 3시에 시작합니다. 여유로운 입장을 위해 20분 전에 도착해 주세요.',
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
      { component: 'calendar', title: '예식 일시' },
      { component: 'place', title: '예식 장소' },
    ],
    moments: ['소중한 만남', '혼인 서약', '감사의 인사와 식사'],
    note: '별도의 드레스 코드 없이 편안한 마음으로 오시면 됩니다. 예식 후 감사의 인사를 전하겠습니다.',
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
      { component: 'calendar', title: '상영일처럼 기다린 날' },
      { component: 'place', title: '예식이 열리는 곳' },
      {
        component: 'notice',
        title: '예식 뒤 포토 타임',
        heading: '사진에 함께해 주세요',
        message:
          '서약을 마친 뒤 홀 앞에서 한 장씩 찍을게요. 휴대폰 카메라도 환영합니다.',
        preset: 'shooting',
      },
    ],
    moments: ['여름의 인사', '우리의 웨딩 필름', '노을빛 리셉션'],
    note: '예식 후 포토 타임이 마련되어 있습니다. 우리와 함께 여러분의 여름도 사진으로 남겨 주세요.',
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
        component: 'afterParty',
        title: '예식 뒤의 건배',
        venue: '그랜드홀 옆 라운지',
        dateTime: '예식 후 오후 4시',
        description:
          '앰버빛 라운지에서 웰컴 드링크와 작은 접시 요리를 나눕니다.',
      },
      { component: 'calendar', title: '예식 시작' },
      { component: 'place', title: '예식과 리셉션' },
      {
        component: 'transportation',
        title: '지하철로 오시면',
        subwayStation: '강남역',
        subwayExit: '11번 출구',
        subwayWalk:
          '출구에서 테헤란로1길로 들어오세요. 로비에서 그랜드홀로 안내해 드립니다.',
      },
    ],
    moments: ['웰컴 드링크', '시티 세리머니', '이브닝 다이닝'],
    note: '대중교통을 이용하시면 더욱 편리합니다. 예식 후 저녁 식사를 함께 즐겨 주세요.',
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
      { component: 'calendar', title: '우리의 만남' },
      { component: 'place', title: '산책의 출발점' },
      {
        component: 'afterParty',
        title: '식후에 가볍게 한 바퀴',
        venue: '웨딩홀 앞마당',
        dateTime: '식사 후',
        description: '시간 되시는 분들과 앞마당을 걸으며 인사 나눌게요.',
      },
    ],
    moments: ['반가운 얼굴들', '둘이 함께하는 약속', '이야기가 있는 식사'],
    note: '예식 전후로 자유롭게 사진을 남겨 주세요. 여러분이 담아 주는 순간도 소중히 간직하겠습니다.',
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
      { component: 'calendar', title: '우리가 결혼하는 날' },
      { component: 'place', title: '함께 모일 홀' },
      {
        component: 'afterParty',
        title: '서약 뒤의 작은 파티',
        venue: '웨딩홀 라운지',
        dateTime: '오후 4시부터',
        description:
          '음악을 들으며 첫 잔을 나눠요. 무알코올 음료도 준비합니다.',
      },
    ],
    moments: ['기분 좋은 인사', '우리다운 세리머니', 'Cheers! 함께 건배'],
    note: '격식보다 즐거움을 준비해 주세요. 마음에 드는 포인트 컬러 하나를 더해 오셔도 좋습니다.',
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
      { component: 'calendar', title: '서약의 오후' },
      { component: 'place', title: '가든홀 입구' },
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
    ],
    moments: ['숲길의 환영', '변치 않을 약속', '따뜻한 저녁'],
    note: '자연과 함께하는 공간입니다. 가벼운 겉옷을 준비하시면 저녁까지 편안하게 즐기실 수 있습니다.',
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
      { component: 'greeting' },
      { component: 'calendar', title: '컨퍼런스 일시' },
      { component: 'place', title: '메인 오디토리움' },
      {
        component: 'sponsorshipInfomation',
        title: '행사를 함께 준비한 파트너',
        images: [
          '/samples/seminar_01/images/01_chatgpt_image_2026년_8월_12일_오후_07_36_16_1_1.png',
          '/samples/seminar_01/images/04_chatgpt_image_2026년_8월_12일_오후_07_36_17_4_1.png',
        ],
      },
    ],
    moments: [
      '비즈니스의 다음 장',
      '현장에서 찾은 성장의 단서',
      '질문과 네트워킹',
    ],
    note: '행사 시작 30분 전부터 입장 가능합니다. 편안한 비즈니스 캐주얼 차림으로 참여해 주세요.',
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
      { component: 'calendar', title: '포럼 일시' },
      {
        component: 'afterParty',
        title: '자리를 옮겨 나누는 대화',
        venue: '오디토리움 앞 라운지',
        dateTime: '강연이 끝나는 오후 4시부터',
        description:
          '테이블마다 한 가지 화두를 놓습니다. 관심 있는 자리로 자유롭게 옮겨 주세요.',
      },
      { component: 'place', title: '강연장과 라운지' },
      {
        component: 'organizerInformation',
        title: '모임을 여는 팀',
        organizer: 'NextGrowth',
        message:
          '서로 다른 업계의 실무자가 한 테이블에 앉는 자리를 기획합니다.',
        image: '/samples/seminar_01/images/09_주최사.png',
      },
    ],
    moments: ['변화를 읽는 시선', '아이디어를 기회로', '열린 대화와 연결'],
    note: '세션 후 자유로운 네트워킹 시간이 이어집니다. 나누고 싶은 질문과 소개를 준비해 오세요.',
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
        component: 'notice',
        title: '워크숍 준비물',
        heading: '필기구 한 자루',
        message:
          '평소 쓰는 펜을 가져와 주세요. 스케치할 종이는 현장에서 나눠 드립니다.',
        preset: 'time',
        image: '/images/showcase/conference-hall.webp',
      },
      { component: 'calendar', title: '워크숍 일시' },
      { component: 'place', title: '워크숍 장소' },
    ],
    moments: [
      '새로운 아이디어의 시작',
      '실행을 만드는 워크숍',
      '인사이트 나누기',
    ],
    note: '짧은 참여형 워크숍이 포함되어 있습니다. 메모할 도구와 열린 마음을 준비해 주세요.',
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
      { component: 'greeting' },
      { component: 'calendar', title: '강연 일시' },
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
    ],
    moments: ['변화의 출발점', '실행하는 리더의 선택', '라이브 Q&A'],
    note: '현장 질의응답이 진행됩니다. 평소 궁금했던 질문을 한 가지씩 준비해 오시면 좋습니다.',
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
    moments: [
      '웰컴 커피와 인사',
      '지속 가능한 성장의 조건',
      '라운드테이블 토크',
    ],
    note: '웰컴 커피가 준비되어 있습니다. 조금 일찍 도착해 편안하게 대화를 시작해 보세요.',
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
    moments: ['웰컴 드링크', '케이크 & 생일 소원', '함께하는 다이닝'],
    note: '선물은 정중히 사양할게요. 함께하는 시간이 가장 큰 선물입니다. 논알코올 음료도 준비되어 있어요.',
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
      '작년 생일 사진을 넘겨 보다가 다들 보고 싶어졌어. 올해는 케이크 앞에서 단체 사진도 한 장 남기자.',
    ],
    sectionStyle: 'paper',
    sections: [
      { component: 'greeting' },
      {
        component: 'notice',
        title: '우리끼리의 사진 교환',
        heading: '가져올 사진 한 장',
        message:
          '같이 찍은 사진도, 요즘 좋아하는 풍경도 좋아. 돌아가며 그날 얘기를 들려줘.',
        preset: 'shooting',
      },
      { component: 'calendar', title: '사진 찍는 날' },
      { component: 'place', title: '모일 곳' },
      {
        component: 'closingComment',
        message: '이번 사진에도 네 자리가 있었으면 좋겠어. 민혁이가',
      },
    ],
    moments: ['오랜만의 안부', '생일 케이크와 사진', '느긋한 저녁 식사'],
    note: '편한 옷차림이면 충분해요. 좋아하는 사진을 한 장씩 가져와 함께 추억을 나눠도 좋아요.',
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
    moments: ['달콤한 웰컴 티', '생일 노래 & 케이크', '우리들의 포토 타임'],
    note: '작은 핑크 포인트를 더해 오면 더 즐거울 거예요. 디저트와 차를 넉넉하게 준비할게요.',
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
    moments: ['파티 체크인', '소원을 말해 봐', '플레이리스트 & 토크'],
    note: '함께 듣고 싶은 노래 한 곡을 골라 와 주세요. 우리의 플레이리스트를 함께 완성해요.',
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
    moments: ['반가운 가족 인사', '두근두근 돌잡이', '첫 생일 축하와 식사'],
    note: '아이가 낯설어할 수 있어 잠시 적응할 시간을 주세요. 유아 의자와 가족 휴식 공간을 준비했습니다.',
  },
  {
    ...firstBirthday,
    id: 'showcase-22',
    name: '민준이의 첫 초대',
    font: 'LINESeedKR',
    description: '파란 고깔모자와 작은 미소로 전하는 사랑스러운 첫 초대장.',
    palette: ['#F3F7FF', '#47629A', '#3D4B66'],
    eyebrow: 'MINJUN’S FIRST BIRTHDAY',
    heading: '민준이의 첫 생일에 놀러 오세요',
    message: [
      '안녕하세요, 어느새 한 살이 된 민준이에요.',
      '많은 사랑 덕분에 하루하루 씩씩하게 자라고 있어요.',
      '첫 번째 생일, 좋아하는 분들과 함께 웃고 싶어요!',
    ],
    moments: ['민준이와 인사해요', '첫 번째 돌잡이', '생일 노래와 가족 식사'],
    note: '민준이와의 사진은 언제든 환영해요. 눈이 부시지 않도록 플래시는 잠시 꺼 주세요.',
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
    heading: '높은 하늘 아래, 같은 길을 걷는 우리',
    message: [
      '산 능선을 따라 걷던 어느 날, 서로의 가장 든든한 편이 되었습니다.',
      '맑은 공기처럼 편안한 마음으로 오래 함께하려 합니다.',
      '저희가 나란히 걷기 시작하는 날, 소중한 여러분을 초대합니다.',
    ],
    moments: ['산뜻한 환영 인사', '함께 걷는 약속', '따뜻한 축하의 식사'],
    note: '맑은 공기와 산 능선이 이어지는 길처럼, 서로의 곁에서 같은 방향으로 걸어가겠습니다.',
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
    heading: '골목을 함께 걷는 일상',
    message: [
      '익숙한 골목과 자주 걷던 거리가 우리만의 풍경이 되었습니다.',
      '평범한 하루를 나누며 서로의 가장 가까운 사람이 되려 합니다.',
      '도시의 한 모퉁이에서 시작될 저희의 약속에 함께해 주세요.',
    ],
    moments: ['반가운 인사와 산책', '우리다운 서약', '함께 나누는 식사'],
    note: '익숙한 골목도 함께 걸으면 새로운 풍경이 됩니다. 평범한 하루를 나누며 오래 사랑하겠습니다.',
  },
];

export function getShowcaseInvitation(id: string) {
  return SHOWCASE_INVITATIONS.find(invitation => invitation.id === id);
}
