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
    heading: '소중한 당신께 보내는 편지',
    message: [
      '기쁜 소식을 전하며 가장 먼저 여러분의 얼굴을 떠올렸습니다.',
      '서로를 아끼는 마음으로 한 가족의 이야기를 시작합니다.',
      '그 첫날, 함께 웃어 주신다면 더없이 행복하겠습니다.',
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
    heading: '우리의 여름을 기억해 주세요',
    message: [
      '매일의 순간을 함께 채워 온 저희가',
      '올여름, 새로운 계절을 시작합니다.',
      '8월 11일의 가장 반가운 얼굴이 되어 주세요.',
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
    heading: '조용히, 오래 사랑하겠습니다',
    message: [
      '화려한 말보다 매일의 작은 다정함으로',
      '서로에게 가장 편안한 집이 되어 주려 합니다.',
      '저희의 소박하고 단단한 약속을 지켜봐 주세요.',
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
    heading: '함께라서 빛나는 여름',
    message: [
      '나란히 걷고, 같은 풍경을 바라보던 날들이 모여',
      '우리만의 가장 아름다운 장면이 되었습니다.',
      '오래도록 꺼내 볼 이 여름의 장면에 함께해 주세요.',
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
    heading: '도시 한가운데, 우리의 시작',
    message: [
      '익숙한 거리도 함께 걸으면 새로운 풍경이 됩니다.',
      '수많은 하루를 지나, 서로의 내일이 되기로 했습니다.',
      '민성과 아현의 다음 장을 함께 축하해 주세요.',
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
    heading: '함께 걷고 싶은 사람에게',
    message: [
      '좋아하는 골목, 자주 가던 카페, 함께 웃었던 오후.',
      '작은 일상 속에서 평생 함께하고 싶은 사람을 만났습니다.',
      '우리의 새로운 일상에 첫 손님이 되어 주세요.',
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
    heading: '가장 우리다운 결혼식',
    message: [
      '서로의 엉뚱한 생각에도 가장 크게 웃어 주는 사이.',
      '지금처럼 즐겁게, 우리만의 속도로 살아가겠습니다.',
      '좋아하는 사람들과 웃음으로 가득한 하루를 만들고 싶습니다.',
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
    heading: '서로에게 깊은 뿌리가 되어',
    message: [
      '계절이 바뀌어도 변함없이 곁을 지키는 나무처럼',
      '서로를 믿고 기대며 함께 자라나려 합니다.',
      '저희의 새로운 뿌리가 내리는 날, 함께해 주세요.',
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
    heading: '다음 비즈니스를 함께 그리다',
    message: [
      '변화의 속도가 빨라질수록, 함께 생각할 시간이 필요합니다.',
      '실행하는 사람들의 경험과 새로운 관점을 나누는 자리.',
      '2026 Annual Business Conference에 여러분을 초대합니다.',
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
    heading: '새로운 관점이 열리는 곳',
    message: [
      '익숙한 해답 너머에서 새로운 가능성을 발견합니다.',
      '다양한 분야의 시선이 만나 더 넓은 지평을 만드는 시간.',
      '다음 기회를 함께 탐색할 여러분을 기다립니다.',
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
    heading: '생각에 작은 불씨를 더하다',
    message: [
      '좋은 아이디어는 작은 대화에서 시작됩니다.',
      '서로의 경험을 나누고, 내일 바로 시도할 영감을 발견하세요.',
      '호기심과 열정을 가진 여러분을 초대합니다.',
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
    heading: '변화를 만드는 한 번의 만남',
    message: [
      '새로운 움직임은 질문하는 용기에서 시작됩니다.',
      '한계를 넘어 실행해 온 사람들의 솔직한 이야기를 듣고',
      '우리의 다음 행동을 함께 찾아보려 합니다.',
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
    heading: '좋은 대화가 남기는 것',
    message: [
      '속도를 잠시 늦추고, 중요한 이야기에 귀 기울입니다.',
      '깊이 있는 인사이트와 편안한 대화가 이어지는 오후.',
      '다음 한 걸음을 위한 생각의 여백을 함께 나눠 주세요.',
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
    heading: '스물일곱, 함께 건배해요',
    message: [
      '좋아하는 사람들과 맛있는 음식, 그리고 끝없는 이야기.',
      '민혁의 스물일곱 번째 생일은 이렇게 보내고 싶어요.',
      '빈손으로 가볍게 와서, 즐거운 기억만 가득 채워 가요.',
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
    heading: '올해의 생일도, 너희와 함께',
    message: [
      '또 하나의 나이보다 더 기대되는 건',
      '오랜만에 한자리에 모일 우리의 모습이에요.',
      '편하게 와서 밥 먹고, 웃고, 사진도 많이 남겨요.',
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
    heading: '우리의 달콤한 오후',
    message: [
      '케이크 한 조각에 다정한 축하를 더해 주세요.',
      '민혁의 생일을 핑크빛 웃음으로 채워 볼까요?',
      '좋아하는 사람들과 보내는 달콤한 오후에 초대해요.',
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
    heading: '스물일곱 번째 페이지',
    message: [
      '새로운 페이지의 첫 줄에 너희의 이름을 적고 싶어요.',
      '함께 웃었던 이야기와 아직 하지 못한 이야기를 모아',
      '스물일곱의 첫 파티에서 만나요.',
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
    heading: '작은 기적이 자란 365일',
    message: [
      '처음 눈을 맞추던 날부터 환하게 웃어 주던 순간까지.',
      '서툰 우리에게 매일 새로운 행복을 알려 준 아이가 첫 생일을 맞아요.',
      '사랑을 보내 주신 여러분과 그 기쁨을 나누고 싶습니다.',
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
