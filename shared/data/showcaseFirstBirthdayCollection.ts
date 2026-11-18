import type { ShowcaseInvitation } from './showcaseInvitations';

export const firstBirthdayCollection: ShowcaseInvitation[] = [
  {
    name: '비단에 담은 첫돌',
    description: '비단 조각보의 오방색 띠와 한복 사진을 담은 돌상 초대장.',
    palette: ['#F9F3E7', '#8A3932', '#302F29'],
    eyebrow: 'FIRST DOL',
    heading: '민준이의 첫 돌상',
    date: '2027-02-20',
    time: '12:00',
    venue: '인비아 한옥 · 사랑채',
    font: '고운 바탕',
    sectionStyle: 'paper',
    id: 'showcase-25',
    type: 'firstBirthday',
    message: [
      '민준이에게 첫 한복을 입히고 작은 상을 차립니다. 실타래와 붓 중 무엇을 먼저 잡을지, 사랑채에서 함께 지켜봐 주세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'myChild',
        title: '오늘 한 살이 된 민준이',
        name: '민준',
        birthday: '2026.02.20',
        message:
          '옷고름을 매어 주면 손뼉부터 쳐요. 오늘은 그 작은 손으로 돌잡이도 합니다.',
        image: '/images/showcase/hanbok.webp',
      },
      {
        component: 'calendar',
        title: '첫돌 잔칫날',
        template: 'calendarType1',
      },
      {
        component: 'timeline',
        title: '사랑채의 잔치 순서',
        items: [
          {
            time: '12:00',
            title: '가족 인사와 기념사진',
          },
          {
            time: '12:20',
            title: '민준이의 돌잡이',
          },
          {
            time: '12:40',
            title: '돌상 떡을 나누는 점심',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '첫돌 상차림',
        subtitle: 'Dol Table',
        style: 'classic',
        courses: [
          {
            name: '식사',
            dishes: ['소고기 미역국', '잡채'],
          },
          {
            name: '답례떡',
            dishes: ['백설기', '수수팥떡'],
          },
        ],
      },
      {
        component: 'place',
        title: '사랑채로 오시는 길',
        detail: '마당을 지나 왼편 사랑채로 들어오세요.',
      },
      {
        component: 'myFamily',
        title: '초대장을 보낸 가족',
        members: [
          {
            relation: '엄마',
            name: '김수연',
          },
          {
            relation: '아빠',
            name: '이현우',
          },
        ],
        message: '민준이 곁에서 함께 보낸 첫해를 여러분과 나누고 싶습니다.',
      },
      {
        component: 'closingComment',
        message:
          '돌상에 올린 실타래처럼 오래오래 이어질 인연에 감사드립니다. 민준이네 올림',
      },
    ],
  },
  {
    name: '사과밭 첫 소풍',
    description: '사과 상자 라벨과 초록 격자무늬로 꾸민 과수원 소풍.',
    palette: ['#FFF4D9', '#883529', '#334A2F'],
    eyebrow: 'ORCHARD PICNIC',
    heading: '민준이의 사과밭으로',
    date: '2027-09-11',
    time: '11:00',
    venue: '인비아 가든 · 과수원 뜰',
    font: 'LINESeedKR',
    sectionStyle: 'rounded',
    id: 'showcase-26',
    type: 'firstBirthday',
    message: [
      '사과가 빨갛게 익을 무렵 민준이가 한 살이 됩니다. 나무 그늘에 돗자리를 펴고 도시락을 같이 열어요.',
    ],
    sections: [
      {
        component: 'picture',
        title: '사과나무 아래에서',
        caption: '처음 만져 본 사과를 한참이나 놓지 않던 오후예요.',
        image: '/images/showcase/orchard.webp',
      },
      {
        component: 'greeting',
      },
      {
        component: 'calendar',
        title: '소풍 가는 날',
        template: 'calendarType2',
      },
      {
        component: 'timeline',
        title: '소풍 시간표',
        items: [
          {
            time: '11:00',
            title: '사과나무 아래 가족사진',
          },
          {
            time: '11:30',
            title: '도시락 열기와 돌잡이',
          },
          {
            time: '12:00',
            title: '축하 카드 읽기',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '소풍 바구니',
        subtitle: 'Picnic Basket',
        style: 'bistro',
        courses: [
          {
            name: '도시락',
            dishes: ['달걀 샌드위치', '구운 채소'],
          },
          {
            name: '후식',
            dishes: ['사과 콤포트'],
          },
        ],
      },
      {
        component: 'dressCode',
        title: '잔디에 앉기 편한 옷',
        colors: ['#FFF4D9', '#883529', '#334A2F'],
        guidelines: ['편한 신발과 햇빛을 가려 줄 모자를 챙겨 주세요.'],
      },
      {
        component: 'place',
        title: '돗자리가 있는 곳',
        detail: '가든 입구의 사과 바구니 앞에서 만나요.',
      },
      {
        component: 'closingComment',
        message: '빈 바구니에 오늘의 웃음을 가득 담아 갈게요. 민준이네 드림',
      },
    ],
  },
  {
    name: '꼬마 선장의 항해일지',
    description: '파란 항로와 출항 도장을 찍은 아기 선장의 승선권.',
    palette: ['#EFF6F5', '#204C70', '#1C384A'],
    eyebrow: 'LITTLE VOYAGER',
    heading: '첫 항해에 함께 타세요',
    date: '2027-06-12',
    time: '14:00',
    venue: '인비아 마린홀 · 블루룸',
    font: 'SUIT',
    sectionStyle: 'outlined',
    id: 'showcase-27',
    type: 'firstBirthday',
    message: [
      '나무 배를 꼭 쥔 우리 집 꼬마 선장이 첫 항해를 시작합니다. 블루룸에서 선원 여러분을 기다릴게요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'timeline',
        title: '선장의 항해일지',
        items: [
          {
            time: '14:00',
            title: '승선 기념 가족사진',
          },
          {
            time: '14:20',
            title: '꼬마 선장의 돌잡이',
          },
          {
            time: '14:45',
            title: '케이크와 간식',
          },
        ],
      },
      {
        component: 'myChild',
        title: '오늘 한 살이 된 민준이',
        name: '민준',
        birthday: '2026.06.12',
        message: '작은 배를 밀어 주면 파도 소리를 흉내 내며 방긋 웃어요.',
        image: '/images/showcase/sea.webp',
      },
      {
        component: 'place',
        title: '승선하는 곳',
        detail: '블루룸 입구에서 이름이 적힌 승선권을 찾아 주세요.',
      },
      {
        component: 'calendar',
        title: '출항 시각',
        template: 'calendarType3',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '함께 만드는 항해도',
        heading: '방명록에 물결을 그려 주세요',
        message:
          '푸른 잉크로 한 줄씩 남겨 주시면 민준이 항해일지에 붙여 둘게요.',
      },
      {
        component: 'closingComment',
        message: '민준이의 항해에 든든한 선원이 되어 주셔서 감사합니다.',
      },
    ],
  },
  {
    name: '달빛 자장가',
    description: '쪽빛 밤하늘에 별자리를 수놓고 포근한 잠자리 사진을 담았어요.',
    palette: ['#F2EFF7', '#635179', '#332B48'],
    eyebrow: 'LUNAR LULLABY',
    heading: '달님에게 들려줄 첫 생일',
    date: '2027-01-16',
    time: '17:00',
    venue: '인비아 라운지 · 달빛방',
    font: '고운 바탕',
    sectionStyle: 'plain',
    id: 'showcase-28',
    type: 'firstBirthday',
    message: [
      '잠들기 전에 불러 주던 노래를 오늘은 함께 흥얼거리고 싶어요. 작은 별 하나가 첫 생일을 맞는 저녁입니다.',
    ],
    sections: [
      {
        component: 'myChild',
        title: '오늘 한 살이 된 민준이',
        name: '민준',
        birthday: '2026.01.16',
        message: '별 무늬 이불 끝을 쥐면 금세 편안한 표정이 돼요.',
        image: '/images/showcase/moon.webp',
      },
      {
        component: 'greeting',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '민준이에게 별을 선물해요',
        heading: '별 모양 카드에 한마디',
        message:
          '저녁 식사 전, 카드에 짧은 자장가나 덕담을 적어 주세요. 부모가 모아 한 권의 그림책으로 엮을게요.',
      },
      {
        component: 'calendar',
        title: '별이 뜰 무렵',
      },
      {
        component: 'place',
        title: '달빛방 안내',
        detail: '라운지 안쪽의 남색 커튼이 달린 방입니다.',
      },
      {
        component: 'timeline',
        title: '저녁의 순서',
        items: [
          {
            time: '17:00',
            title: '별 카드에 축하 인사 쓰기',
          },
          {
            time: '17:20',
            title: '첫 생일 촛불과 돌잡이',
          },
          {
            time: '17:45',
            title: '가족 저녁 식사',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '오늘 들려주신 목소리를 오래 기억할게요. 좋은 꿈 꾸세요.',
      },
    ],
  },
  {
    name: '한 살 사진관',
    description: '흑백 은염 인화지와 필름 가장자리로 엮은 첫돌 사진전.',
    palette: ['#F4F1EB', '#55463A', '#242424'],
    eyebrow: 'PORTRAIT STUDIO',
    heading: '한 살의 얼굴을 전시합니다',
    date: '2027-03-20',
    time: '13:00',
    venue: '인비아 스튜디오 · 사진실',
    font: 'Noto Serif KR',
    sectionStyle: 'paper',
    id: 'showcase-29',
    type: 'firstBirthday',
    message: [
      '웃다가 찡그리고 다시 활짝. 고른 사진마다 다른 얼굴이라 첫돌에 맞춰 작은 사진전을 열기로 했어요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'picture',
        title: '첫 전시의 대표 사진',
        caption: '셔터 소리에 웃음이 터진 순간을 골랐습니다.',
        image: '/images/showcase/portrait.webp',
      },
      {
        component: 'myFamily',
        title: '초대장을 보낸 가족',
        members: [
          {
            relation: '엄마',
            name: '김수연',
          },
          {
            relation: '아빠',
            name: '이현우',
          },
        ],
        message: '엄마는 사진을 골랐고 아빠는 액자 뒷면에 날짜를 적었습니다.',
      },
      {
        component: 'calendar',
        title: '사진관 여는 날',
        template: 'calendarType5',
      },
      {
        component: 'dressCode',
        title: '흑백 단체사진',
        colors: ['#F4F1EB', '#55463A', '#242424'],
        guidelines: ['잔무늬가 적은 옷을 입으시면 표정이 사진에 더 잘 보여요.'],
      },
      {
        component: 'timeline',
        title: '사진관 예약표',
        items: [
          {
            time: '13:00',
            title: '전시 둘러보기',
          },
          {
            time: '13:30',
            title: '돌잡이와 가족사진 촬영',
          },
          {
            time: '14:00',
            title: '인화 사진 나누기',
          },
        ],
      },
      {
        component: 'place',
        title: '스튜디오 위치',
        detail: '사진실 앞 작은 갤러리에서 먼저 인사 나눠요.',
      },
      {
        component: 'closingComment',
        message: '여러분의 얼굴까지 담아 첫 앨범을 완성할게요.',
      },
    ],
  },
  {
    name: '꼬마 공룡 박물관',
    description:
      '숲빛 전시 라벨과 장난감 공룡 사진으로 만든 작은 박물관 입장권.',
    palette: ['#EFF2D8', '#426143', '#243B30'],
    eyebrow: 'DINO MUSEUM',
    heading: '첫돌 박물관이 문을 열어요',
    date: '2027-04-17',
    time: '11:30',
    venue: '인비아 키즈룸 · 초록 전시실',
    font: 'ONE Mobile POP',
    sectionStyle: 'rounded',
    id: 'showcase-30',
    type: 'firstBirthday',
    message: [
      '민준이의 방에 있는 공룡들이 오늘만큼은 전시실의 주인공이에요. 작은 관장님의 첫 생일에 놀러 오세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'myChild',
        title: '오늘 한 살이 된 민준이',
        name: '민준',
        birthday: '2026.04.17',
        message: '목이 긴 초록 공룡을 가장 먼저 데려와 손님들에게 건넵니다.',
        image: '/images/showcase/dino.webp',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '전시실에서 즐겨요',
        heading: '공룡 발자국을 따라오세요',
        message:
          '바닥에 붙인 발자국 끝에는 민준이가 좋아하는 장난감과 돌잡이 상이 있어요.',
      },
      {
        component: 'place',
        title: '초록 전시실',
        detail: '키즈룸 안쪽 장난감 전시대에서 만나요.',
      },
      {
        component: 'calendar',
        title: '개관 일시',
      },
      {
        component: 'mealMenu',
        title: '관장님의 점심',
        subtitle: 'Dino Lunch',
        style: 'bistro',
        courses: [
          {
            name: '따뜻한 접시',
            dishes: ['단호박 수프', '미니 주먹밥'],
          },
          {
            name: '후식',
            dishes: ['공룡 모양 쿠키'],
          },
        ],
      },
      {
        component: 'closingComment',
        message: '작은 박물관의 첫 손님이 되어 주셔서 감사합니다.',
      },
    ],
  },
  {
    name: '첫돌 우체국',
    description: '우표 테두리와 항공우편 띠에 아이의 사진을 붙인 첫 편지.',
    palette: ['#FFF2E7', '#9B463C', '#424A58'],
    eyebrow: 'AIR MAIL',
    heading: '민준이가 띄우는 첫 편지',
    date: '2027-05-15',
    time: '12:30',
    venue: '인비아 패밀리룸 · 편지방',
    font: '고운 바탕',
    sectionStyle: 'outlined',
    id: 'showcase-31',
    type: 'firstBirthday',
    message: [
      '받는 분 칸에 한 분씩 이름을 적었습니다. 민준이가 태어나서 처음 띄우는 생일 초대장이에요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'myFamily',
        title: '초대장을 보낸 가족',
        members: [
          {
            relation: '엄마',
            name: '김수연',
          },
          {
            relation: '아빠',
            name: '이현우',
          },
        ],
        message: '엄마와 아빠가 봉투를 접고 민준이는 손도장을 보탰어요.',
      },
      {
        component: 'picture',
        title: '편지가 도착했어요',
        caption: '봉투를 한참 들여다보던 민준이의 오후.',
        image: '/images/showcase/post.webp',
      },
      {
        component: 'calendar',
        title: '편지를 여는 날',
        template: 'calendarType2',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '한 살에게 보내는 답장',
        heading: '손편지를 남겨 주세요',
        message:
          '편지방에 놓인 엽서에 한 문장씩 적어 주세요. 두 돌이 되면 함께 읽을게요.',
      },
      {
        component: 'place',
        title: '첫돌 우체통 위치',
        detail: '패밀리룸 입구의 빨간 우체통 옆으로 오세요.',
      },
      {
        component: 'timeline',
        title: '편지방 일정',
        items: [
          {
            time: '12:30',
            title: '축하 엽서 접수',
          },
          {
            time: '12:50',
            title: '돌잡이와 답장 추첨',
          },
          {
            time: '13:10',
            title: '가족 식사',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '소중한 답장은 우리 가족의 보관함에 차곡차곡 모아 둘게요.',
      },
    ],
  },
];
