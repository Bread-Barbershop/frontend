import type { ShowcaseInvitation } from './showcaseInvitations';

export const birthdayCollection: ShowcaseInvitation[] = [
  {
    name: '생일 B면',
    description: '코발트색 레코드 재킷에 담은 생일 청음회와 신청곡 목록.',
    palette: ['#EDF1FC', '#253F91', '#1F2D51'],
    eyebrow: 'B-SIDE SESSION',
    heading: '내 생일의 B면을 틀어요',
    date: '2027-02-27',
    time: '18:00',
    venue: '인비아 리스닝룸 · B사이드',
    font: 'SUIT',
    sectionStyle: 'outlined',
    id: 'showcase-32',
    type: 'birthday',
    message: [
      '올해 생일에는 각자 좋아하는 노래 한 곡씩 가져와요. 턴테이블 옆에 케이크를 놓고 다 같이 B면까지 들을게요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'picture',
        title: '오늘의 턴테이블',
        caption: '첫 곡은 비워 두었어요. 제일 먼저 도착한 친구가 골라 줘요.',
        image: '/images/showcase/vinyl.webp',
      },
      {
        component: 'timeline',
        title: '오늘의 트랙 리스트',
        items: [
          {
            time: '18:00',
            title: 'A면 · 웰컴 트랙',
          },
          {
            time: '18:30',
            title: '신청곡과 생일 케이크',
          },
          {
            time: '19:00',
            title: 'B면 · 자유 청음',
          },
        ],
      },
      {
        component: 'calendar',
        title: '재생 버튼을 누르는 날',
        template: 'calendarType3',
      },
      {
        component: 'place',
        title: '청음실 입구',
        detail: 'B사이드 방 문에 레코드 재킷을 걸어 둘게요.',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '한 곡만 골라 줘',
        heading: '신청곡 적는 법',
        message: '입구의 슬리브에 곡 제목과 이 곡을 고른 이유를 적어 주세요.',
      },
      {
        component: 'closingComment',
        message: '마지막 바늘이 올라갈 때까지 같이 있어 줘. 민혁 드림',
      },
    ],
  },
  {
    name: '레몬 타르트 클럽',
    description: '레몬빛 줄무늬와 타르트 사진으로 차린 햇살 가득한 점심 식탁.',
    palette: ['#FFF6C9', '#506521', '#293E30'],
    eyebrow: 'TARTE AU CITRON',
    heading: '레몬 타르트가 식기 전에',
    date: '2027-05-22',
    time: '12:00',
    venue: '인비아 키친 · 테라스',
    font: '고운 바탕',
    sectionStyle: 'rounded',
    id: 'showcase-33',
    type: 'birthday',
    message: [
      '생일 아침에 레몬 타르트를 구울 거예요. 테라스에 찬 레모네이드도 준비할 테니 점심 먹으러 와요.',
    ],
    sections: [
      {
        component: 'mealMenu',
        title: '레몬빛 식탁',
        subtitle: 'Birthday Lunch',
        style: 'bistro',
        courses: [
          {
            name: '첫 접시',
            dishes: ['레몬 리코타 샐러드'],
          },
          {
            name: '메인',
            dishes: ['바질 파스타'],
          },
          {
            name: '후식',
            dishes: ['레몬 타르트'],
          },
        ],
      },
      {
        component: 'greeting',
      },
      {
        component: 'picture',
        title: '한 조각 먼저',
        caption: '레몬 껍질을 곱게 갈아 올린 오늘의 생일 케이크예요.',
        image: '/images/showcase/citrus.webp',
      },
      {
        component: 'calendar',
        title: '점심 약속',
      },
      {
        component: 'place',
        title: '햇볕 드는 테라스',
        detail: '키친 안쪽 유리문을 지나 오른쪽 긴 테이블이에요.',
      },
      {
        component: 'dressCode',
        title: '테라스에서 편하게',
        colors: ['#FFF6C9', '#506521', '#293E30'],
        guidelines: ['햇볕 좋은 자리예요. 얇은 겉옷을 하나 챙겨 와요.'],
      },
      {
        component: 'closingComment',
        message: '마지막 한 조각은 제일 늦게 오는 친구 몫으로 남겨 둘게요.',
      },
    ],
  },
  {
    name: '생일 심야극장',
    description: '버건디 벨벳과 절취선이 있는 티켓으로 꾸민 생일 상영회.',
    palette: ['#F8EEE2', '#792E39', '#38252A'],
    eyebrow: 'MIDNIGHT CINEMA',
    heading: '오늘의 주인공은 우리',
    date: '2027-07-17',
    time: '20:00',
    venue: '인비아 시네마 · 소극장',
    font: 'SUIT',
    sectionStyle: 'paper',
    id: 'showcase-34',
    type: 'birthday',
    message: [
      '오래 좋아한 영화를 친구들과 다시 보고 싶어서 작은 극장을 빌렸어요. 생일 저녁, 팝콘은 제가 쏩니다.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'calendar',
        title: '상영 일시',
        template: 'calendarType5',
      },
      {
        component: 'picture',
        title: '당신의 좌석',
        caption: '붉은 의자와 방금 튀긴 팝콘이 기다리고 있어요.',
        image: '/images/showcase/cinema.webp',
      },
      {
        component: 'place',
        title: '표를 받는 곳',
        detail: '소극장 매표대에서 민혁의 생일 상영회라고 말해 주세요.',
      },
      {
        component: 'timeline',
        title: '오늘의 상영표',
        items: [
          {
            time: '20:00',
            title: '입장과 예고편',
          },
          {
            time: '20:15',
            title: '영화 상영',
          },
          {
            time: '22:00',
            title: '엔딩 크레디트와 생일 케이크',
          },
        ],
      },
      {
        component: 'notice',
        preset: 'time',
        title: '영화가 시작되면',
        heading: '휴대폰은 무음으로',
        message: '감상평은 엔딩 뒤에 준비한 엽서에 한 줄씩 남겨 줘요.',
      },
      {
        component: 'closingComment',
        message: '오늘의 엔딩 크레디트에는 여기 온 모두의 이름을 적을게요.',
      },
    ],
  },
  {
    name: '꽃시장 브런치',
    description: '꽃 한 다발과 갓 구운 빵 사진을 실은 플로리스트의 주문서.',
    palette: ['#FBF0F0', '#7C4355', '#403E38'],
    eyebrow: 'FLOWER MARKET',
    heading: '생일 꽃다발을 함께 묶어요',
    date: '2027-04-24',
    time: '10:30',
    venue: '인비아 플라워룸 · 온실',
    font: 'Noto Serif KR',
    sectionStyle: 'plain',
    id: 'showcase-35',
    type: 'birthday',
    message: [
      '아침 시장에서 고른 꽃을 한 통 가득 가져올게요. 빵을 나눠 먹고 집에 갈 때는 다 같이 꽃 한 다발씩 안고 가요.',
    ],
    sections: [
      {
        component: 'picture',
        title: '아침에 골라 온 꽃',
        caption: '오늘은 라넌큘러스와 양귀비를 주인공으로 골랐어요.',
        image: '/images/showcase/flowers.webp',
      },
      {
        component: 'greeting',
      },
      {
        component: 'mealMenu',
        title: '온실의 브런치',
        subtitle: 'Morning Table',
        style: 'bistro',
        courses: [
          {
            name: '빵과 과일',
            dishes: ['버터 브리오슈', '제철 딸기'],
          },
          {
            name: '마실 것',
            dishes: ['밀크티', '귤 주스'],
          },
        ],
      },
      {
        component: 'calendar',
        title: '온실에서 만날 시간',
      },
      {
        component: 'timeline',
        title: '오전의 할 일',
        items: [
          {
            time: '10:30',
            title: '브런치 차리기',
          },
          {
            time: '11:00',
            title: '생일 촛불 불기',
          },
          {
            time: '11:20',
            title: '꽃다발 묶기',
          },
        ],
      },
      {
        component: 'place',
        title: '온실 테이블',
        detail: '플라워룸에서 앞치마를 받아 온실로 들어오세요.',
      },
      {
        component: 'closingComment',
        message: '같은 꽃도 묶는 사람마다 다를 테니, 단체사진을 꼭 남겨요.',
      },
    ],
  },
  {
    name: '별 아래 생일 캠프',
    description: '솔숲 랜턴 사진과 능선 일러스트를 조합한 캠핑 패치 초대장.',
    palette: ['#F4F0DE', '#405744', '#253D36'],
    eyebrow: 'BIRTHDAY BASECAMP',
    heading: '모닥불 옆 한 자리',
    date: '2027-10-09',
    time: '17:30',
    venue: '인비아 캠프 · 솔숲 사이트',
    font: 'LINESeedKR',
    sectionStyle: 'outlined',
    id: 'showcase-36',
    type: 'birthday',
    message: [
      '올해는 별이 보이는 곳에서 생일을 보낼래요. 솔숲 사이트에 랜턴을 달고 따뜻한 수프를 올려 둘게요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'place',
        title: '캠프 집결지',
        detail: '솔숲 입구에서 랜턴이 걸린 텐트를 찾아 주세요.',
      },
      {
        component: 'calendar',
        title: '해 지기 전 만나요',
        template: 'calendarType2',
      },
      {
        component: 'picture',
        title: '밤을 밝힐 자리',
        caption: '랜턴을 켜 둔 상자 옆에 의자를 놓아두었어요.',
        image: '/images/showcase/camp.webp',
      },
      {
        component: 'dressCode',
        title: '숲의 저녁 차림',
        colors: ['#F4F0DE', '#405744', '#253D36'],
        guidelines: [
          '해가 지면 쌀쌀해요. 따뜻한 겉옷과 발을 덮는 신발이 편해요.',
        ],
      },
      {
        component: 'mealMenu',
        title: '모닥불 저녁',
        subtitle: 'Camp Supper',
        style: 'bistro',
        courses: [
          {
            name: '저녁',
            dishes: ['감자 수프', '구운 옥수수'],
          },
          {
            name: '간식',
            dishes: ['마시멜로', '핫초코'],
          },
        ],
      },
      {
        component: 'closingComment',
        message: '별이 뜨면 따뜻한 컵을 들고 같이 올려다봐요.',
      },
    ],
  },
];
