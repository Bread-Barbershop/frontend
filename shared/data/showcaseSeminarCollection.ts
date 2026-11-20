import type { ShowcaseInvitation } from './showcaseInvitations';

export const seminarCollection: ShowcaseInvitation[] = [
  {
    name: '흙의 작업실',
    description: '물레 위 손동작을 크게 싣고 흙빛 견본을 곁들인 공예 워크숍.',
    palette: ['#F6EAE2', '#8A4734', '#42362F'],
    eyebrow: 'MATERIAL STUDIES',
    heading: '손끝으로 읽는 흙',
    date: '2027-03-13',
    time: '14:00',
    venue: '인비아 공방 · 물레실',
    font: 'Noto Serif KR',
    sectionStyle: 'paper',
    id: 'showcase-37',
    type: 'seminar',
    message: [
      '같은 흙도 손에 주는 힘에 따라 다른 그릇이 됩니다. 물레 앞에서 흙을 만져 보고 각자의 작은 잔을 빚습니다.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'picture',
        title: '물레 위의 손',
        caption: '속도를 낮추고 양손의 압력을 맞추는 과정부터 살펴봅니다.',
        image: '/images/showcase/clay.webp',
      },
      {
        component: 'speakerInformation',
        title: '물레 시연과 작업 지도',
        name: '정우진 도예가',
        bio: '생활 도자기를 만드는 도예가입니다. 오늘은 손에 닿는 흙의 밀도로 물레 속도와 힘을 조절하는 방법을 보여 드립니다.',
        image: '/images/showcase/conference-speaker.webp',
      },
      {
        component: 'timeline',
        title: '작업실 프로그램',
        items: [
          {
            time: '14:00',
            title: '흙의 수분과 질감 관찰',
          },
          {
            time: '14:25',
            title: '물레 성형 시연',
          },
          {
            time: '15:00',
            title: '개별 잔 만들기와 피드백',
          },
        ],
      },
      {
        component: 'calendar',
        title: '워크숍 일시',
      },
      {
        component: 'dressCode',
        title: '작업복 안내',
        colors: ['#F6EAE2', '#8A4734', '#42362F'],
        guidelines: [
          '흙이 묻어도 괜찮은 옷으로 오세요. 앞치마는 공방에서 제공합니다.',
        ],
      },
      {
        component: 'place',
        title: '작업실 위치',
        detail: '공방 안쪽 물레실에 개인 도구를 준비해 둡니다.',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '완성된 잔 찾기',
        heading: '가마 소성 후 수령',
        message:
          '작품 바닥에 이름을 새겨 주세요. 소성이 끝나면 공방에서 수령 일정을 안내합니다.',
      },
      {
        component: 'closingComment',
        message:
          '당신의 손이 남긴 모양을 작업실에서 만날 수 있기를 기대합니다.',
      },
    ],
  },
  {
    name: '프리즘 광학 세미나',
    description: '빛의 스펙트럼 사진과 파장 눈금으로 짠 광학 실험 프로그램.',
    palette: ['#EEF2F6', '#405A76', '#1F2C39'],
    eyebrow: 'SPECTRUM LAB',
    heading: '빛이 갈라지는 순간',
    date: '2027-06-19',
    time: '15:00',
    venue: '인비아 랩 · 광학실',
    font: 'SUIT',
    sectionStyle: 'outlined',
    id: 'showcase-38',
    type: 'seminar',
    message: [
      '유리 프리즘에 흰빛을 통과시키고, 벽에 맺힌 색의 간격을 직접 재어 봅니다. 관찰 기록을 함께 비교할 분들을 초대합니다.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'timeline',
        title: '실험 순서',
        items: [
          {
            time: '15:00',
            title: '굴절과 분산 미니 강연',
          },
          {
            time: '15:25',
            title: '프리즘 각도별 스펙트럼 기록',
          },
          {
            time: '16:00',
            title: '팀별 관찰 결과 비교',
          },
        ],
      },
      {
        component: 'picture',
        title: '한 줄기 빛의 경로',
        caption: '입사각을 바꿀 때마다 색 띠가 이동하는 모습을 살펴봅니다.',
        image: '/images/showcase/prism.webp',
      },
      {
        component: 'calendar',
        title: '실험실 개방 시간',
        template: 'calendarType4',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '기록지 배부',
        heading: '연필 한 자루면 충분합니다',
        message:
          '광원과 프리즘, 눈금이 표시된 실험 용지는 자리마다 준비해 둡니다.',
      },
      {
        component: 'place',
        title: '실험실 안내',
        detail: '광학실 입구에서 팀 번호와 테이블을 확인해 주세요.',
      },
      {
        component: 'closingComment',
        message:
          '당일 기록한 스펙트럼은 실험 노트에 담아 가져가실 수 있습니다.',
      },
    ],
  },
  {
    name: '도시 산책 기록',
    description: '건축 사진과 답사 경로를 함께 읽는 도시 관찰자의 현장 수첩.',
    palette: ['#F4F2E8', '#516048', '#323B32'],
    eyebrow: 'URBAN FIELD NOTES',
    heading: '걷는 속도로 읽는 도시',
    date: '2027-09-18',
    time: '10:00',
    venue: '인비아 건축라운지 · 로비',
    font: 'SUIT',
    sectionStyle: 'plain',
    id: 'showcase-39',
    type: 'seminar',
    message: [
      '늘 지나던 계단도 천천히 보면 새로운 길이 보입니다. 짧은 강의 후 골목을 걸으며 도시의 높이와 그림자를 스케치합니다.',
    ],
    sections: [
      {
        component: 'picture',
        title: '답사 노트의 첫 장',
        caption: '계단의 폭과 난간의 그림자를 바탕으로 사람의 동선을 읽습니다.',
        image: '/images/showcase/city.webp',
      },
      {
        component: 'greeting',
      },
      {
        component: 'place',
        title: '답사 집결지',
        detail: '로비의 큰 도면 앞에서 모여 함께 출발합니다.',
      },
      {
        component: 'timeline',
        title: '도보 답사 코스',
        items: [
          {
            time: '10:00',
            title: '로비에서 지도 읽기',
          },
          {
            time: '10:20',
            title: '골목 계단과 경사로 답사',
          },
          {
            time: '11:10',
            title: '스케치 공유와 토의',
          },
        ],
      },
      {
        component: 'calendar',
        title: '걷는 날',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '현장 스케치',
        heading: '발걸음으로 길의 폭을 재어 보세요',
        message:
          '지도에 계단의 폭과 경사 방향을 적어 둡니다. 돌아와서 같은 구간을 걸은 다른 팀의 기록과 겹쳐 봅니다.',
      },
      {
        component: 'dressCode',
        title: '답사 준비물',
        colors: ['#F4F2E8', '#516048', '#323B32'],
        guidelines: [
          '걷기 편한 신발과 작은 수첩을 가져오세요. 클립보드는 현장에서 빌려드립니다.',
        ],
      },
      {
        component: 'closingComment',
        message: '여러분이 찾은 도시의 한 장면을 마지막 지도에 더해 주세요.',
      },
    ],
  },
  {
    name: '커피 감각 연구소',
    description: '커핑 볼 사진 아래 향미와 시음 순서를 적어 둔 테이스팅 카드.',
    palette: ['#F8EFDC', '#80522F', '#433627'],
    eyebrow: 'CUPPING ROOM',
    heading: '한 잔을 읽는 세 가지 감각',
    date: '2027-11-13',
    time: '13:30',
    venue: '인비아 로스터리 · 커핑룸',
    font: '고운 바탕',
    sectionStyle: 'rounded',
    id: 'showcase-40',
    type: 'seminar',
    message: [
      '같은 원두에서도 누군가는 감귤을, 누군가는 견과를 떠올립니다. 세 잔을 블라인드로 맛보고 자기만의 언어로 향미를 기록해 보세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'calendar',
        title: '커핑 세션 예약 시간',
        template: 'calendarType1',
      },
      {
        component: 'timeline',
        title: '테이스팅 순서',
        items: [
          {
            time: '13:30',
            title: '마른 원두의 향 맡기',
          },
          {
            time: '13:50',
            title: '세 잔 블라인드 커핑',
          },
          {
            time: '14:20',
            title: '향미 노트 교환',
          },
        ],
      },
      {
        component: 'picture',
        title: '세 잔을 놓는 테이블',
        caption: '각 자리에는 커핑 스푼과 기록 카드, 입을 헹굴 물이 놓입니다.',
        image: '/images/showcase/coffee.webp',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '시음 전 안내',
        heading: '향수는 하루 쉬어 주세요',
        message:
          '커피 향을 함께 느낄 수 있도록 진한 향이 나는 제품은 피해주세요.',
      },
      {
        component: 'place',
        title: '로스터리 커핑룸',
        detail: '로스팅 기계 옆 유리문에서 명단을 확인합니다.',
      },
      {
        component: 'closingComment',
        message:
          '정답을 찾을 필요는 없습니다. 오늘 느낀 향 하나를 적어 가져가세요.',
      },
    ],
  },
];
