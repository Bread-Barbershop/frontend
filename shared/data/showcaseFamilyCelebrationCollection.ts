import type { ShowcaseInvitation } from './showcaseInvitations';

export const familyCelebrationCollection: ShowcaseInvitation[] = [
  {
    id: 'showcase-41',
    type: 'birthday',
    name: '생신 꽃편지',
    description: '꽃을 곁들인 편지로 어머니의 생신 모임에 가족을 초대해요.',
    palette: ['#FFF8F1', '#773845', '#352B29'],
    font: '고운 바탕',
    sectionStyle: 'paper',
    eyebrow: '가족이 보내는 편지',
    heading: '어머니께 드리는 꽃편지',
    message: [
      '어머니의 생신을 맞아 자녀와 손주들이 모입니다.',
      '따뜻한 밥 한 끼와 반가운 이야기로 생신상을 함께 채워 주세요.',
    ],
    date: '2027-05-08',
    time: '12:00',
    venue: '목련정',
    sections: [
      { component: 'greeting' },
      {
        component: 'picture',
        title: '생신상을 차렸어요',
        image: '/images/showcase/flowers.webp',
        caption: '어머니께서 좋아하시는 꽃을 놓았습니다.',
      },
      { component: 'calendar', title: '함께하는 날' },
      {
        component: 'mealMenu',
        title: '어머니의 생신상',
        subtitle: '온 식구가 나누는 점심',
        style: 'garden',
        courses: [
          { name: '생신상', dishes: ['들깨미역국', '소갈비찜', '잡채'] },
          { name: '다과상', dishes: ['쑥설기', '따뜻한 대추차'] },
        ],
      },
      {
        component: 'timeline',
        title: '꽃편지를 읽는 시간',
        items: [
          { time: '12:00', title: '어머니와 함께 점심 식사' },
          { time: '13:00', title: '손주들의 편지 낭독' },
          { time: '13:20', title: '꽃다발을 들고 가족사진' },
        ],
      },
      { component: 'place', title: '식사 장소', detail: '2층 가족실' },
      {
        component: 'notice',
        preset: 'party',
        title: '꽃편지에 한 줄',
        heading: '어머니와의 추억을 적어 주세요',
        message:
          '자리마다 작은 꽃카드를 놓아둘게요. 어머니와 함께 웃었던 날을 적어 주시면 손주들이 모아 읽어 드릴게요.',
        image: '/images/showcase/love-letter.webp',
      },
      { component: 'closingComment', message: '사랑을 담아, 자녀와 손주 올림' },
    ],
  },
  {
    id: 'showcase-42',
    type: 'birthday',
    name: '칠순 감사연',
    description: '짙은 쪽빛과 한지빛 글씨로 아버지의 칠순 식사를 안내해요.',
    largePrint: true,
    palette: ['#FCF8ED', '#203C50', '#192C35'],
    font: '고운 바탕',
    sectionStyle: 'plain',
    eyebrow: '가족 초대',
    heading: '아버지의 칠순에 모십니다',
    message: [
      '아버지 김정호 님의 칠순을 맞아 감사의 자리를 마련했습니다.',
      '함께 식사하시며 따뜻한 축하를 나눠 주세요.',
    ],
    date: '2027-05-15',
    time: '12:00',
    venue: '청연정',
    sections: [
      { component: 'greeting' },
      { component: 'calendar', title: '잔치 일시' },
      { component: 'place', title: '식사 장소', detail: '1층 소나무실' },
      {
        component: 'transportation',
        title: '차로 오시는 분께',
        parkingHours:
          '식사하시는 동안 주차하실 수 있습니다. 돌아가실 때 소나무실 입구에서 주차 확인을 받아 주세요.',
      },
      {
        component: 'timeline',
        title: '칠순 잔치 순서',
        items: [
          { time: '12:00', title: '아버지께 큰절과 감사 편지' },
          { time: '12:15', title: '축하 떡을 자르고 점심 식사' },
          { time: '13:10', title: '아버지와 기념사진' },
        ],
      },
      {
        component: 'picture',
        title: '아버지께 드리는 편지',
        image: '/images/showcase/love-letter.webp',
        caption:
          '아버지, 비 오는 날이면 정류장에서 우산을 들고 기다려 주셨지요. 이제는 저희가 마중 나갈게요. 칠순을 축하드립니다.',
      },
      {
        component: 'notice',
        preset: 'shooting',
        title: '옛 사진을 찾습니다',
        heading: '아버지와 함께 찍은 한 장',
        message:
          '함께 찍은 옛 사진이 있다면 가져와 주세요. 식사 자리에서 사진을 돌려 보며 그날 이야기를 듣고 싶습니다.',
      },
      {
        component: 'closingComment',
        message: '기쁜 날 함께해 주셔서 고맙습니다. 김정호의 가족 올림',
      },
    ],
  },
  {
    id: 'showcase-43',
    type: 'birthday',
    name: '팔순 가족 잔치',
    description:
      '할머니와 할아버지의 팔순 잔치를 햇살 드는 정원 식탁으로 꾸몄어요.',
    largePrint: true,
    palette: ['#FAF8EE', '#294D36', '#25382C'],
    font: 'SUIT',
    sectionStyle: 'plain',
    eyebrow: '팔순 초대',
    heading: '두 분의 여든을 축하합니다',
    message: [
      '할머니와 할아버지의 팔순을 함께 축하하려고 합니다.',
      '두 분께 오래 기억될 하루가 되도록 얼굴을 보여 주세요.',
    ],
    date: '2027-06-05',
    time: '13:00',
    venue: '솔마루 정원',
    sections: [
      { component: 'calendar', title: '모이는 시간' },
      { component: 'place', title: '모이는 곳', detail: '1층 정원실' },
      { component: 'greeting' },
      {
        component: 'gallery',
        title: '두 분을 위해 차린 정원 식탁',
        template: 'galleryType1',
        ratio: '4:3',
        images: [
          '/images/showcase/garden-table.webp',
          '/images/showcase/flowers.webp',
        ],
      },
      {
        component: 'timeline',
        title: '세대가 함께하는 오후',
        items: [
          { time: '13:00', title: '할머니, 할아버지와 점심 식사' },
          { time: '14:00', title: '손주들의 축하 노래' },
          { time: '14:20', title: '정원에서 삼대 가족사진' },
        ],
      },
      {
        component: 'notice',
        preset: 'shooting',
        title: '가족사진 찍는 곳',
        heading: '두 분을 모시고 정원으로',
        message:
          '축하 노래가 끝나면 정원실 앞 나무 그늘로 모여 주세요. 비가 오면 밖으로 나가지 않고 정원실에서 함께 찍겠습니다.',
      },
      {
        component: 'closingComment',
        message: '할머니, 할아버지, 오래오래 건강하세요. 손주들 올림',
      },
    ],
  },
  {
    id: 'showcase-44',
    type: 'wedding',
    name: '정갈한 혼례 초대',
    description: '두 사람의 이름과 예식 일시를 큰 한글로 또렷하게 전해요.',
    largePrint: true,
    palette: ['#FFFAF3', '#5B3846', '#332C30'],
    font: '고운 바탕',
    sectionStyle: 'plain',
    eyebrow: '결혼식 초대',
    heading: '저희 결혼합니다',
    message: [
      '민서와 지훈, 두 사람이 부부가 되는 날입니다.',
      '귀한 걸음으로 저희의 시작을 함께해 주세요.',
    ],
    date: '2027-06-12',
    time: '14:00',
    venue: '서원 예식당',
    sections: [
      { component: 'calendar', title: '예식 일시' },
      { component: 'greeting' },
      {
        component: 'picture',
        title: '두 사람의 약속',
        image: '/images/showcase/vow-rings.webp',
        caption:
          '저녁이면 마주 앉아 그날 있었던 일을 묻는 부부가 되겠습니다. 민서와 지훈 드림',
      },
      { component: 'place', title: '오시는 곳', detail: '2층 예식홀' },
      {
        component: 'timeline',
        title: '예식 순서',
        items: [
          { time: '14:00', title: '두 사람의 입장과 혼인 서약' },
          { time: '14:30', title: '양가 가족과 하객 기념사진' },
          { time: '15:00', title: '연회장에서 식사' },
        ],
      },
      {
        component: 'faq',
        title: '예식 당일 안내',
        items: [
          {
            question: '식권은 어디에서 받나요?',
            answer:
              '예식 전 2층 접수대에서 받아 주세요. 촬영을 마치고 1층 연회장으로 오시면 됩니다.',
          },
          {
            question: '가족사진은 어디에서 기다리면 될까요?',
            answer:
              '행진이 끝난 뒤 예식홀 앞줄에 앉아 계시면 양가 가족부터 안내해 드립니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '축하해 주시는 마음을 소중히 간직하겠습니다. 민서와 지훈 드림',
      },
    ],
  },
];
