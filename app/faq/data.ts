export const FAQ_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'getting-started', label: '시작하기' },
  { id: 'editing', label: '초대장 편집' },
  { id: 'publishing', label: '발행 및 공유' },
  { id: 'account', label: '계정 및 데이터' },
] as const;

export type FaqCategoryId = (typeof FAQ_CATEGORIES)[number]['id'];
export type FaqItemCategoryId = Exclude<FaqCategoryId, 'all'>;

export type FaqItem = {
  id: string;
  category: FaqItemCategoryId;
  question: string;
  answer: string;
};

// 문항을 추가할 때 이 배열에 항목을 넣고 FAQ_CATEGORIES의 id를 category로 지정합니다.
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'free-service',
    category: 'getting-started',
    question: 'Invia는 무료로 사용할 수 있나요?',
    answer:
      '네. 현재 Invia의 초대장 제작, 저장, 발행 기능은 무료로 제공됩니다. Google 계정으로 로그인하면 바로 새 초대장을 만들 수 있습니다.',
  },
  {
    id: 'supported-devices',
    category: 'getting-started',
    question: '어떤 환경에서 초대장을 만들 수 있나요?',
    answer:
      '초대장 편집기는 PC 웹 브라우저 전용이며, 최대 1340px 너비의 편집 화면을 지원합니다. 모바일에서는 초대장을 편집할 수 없습니다. 발행된 초대장은 모바일과 PC에서 모두 확인할 수 있습니다.',
  },
  {
    id: 'save-progress',
    category: 'editing',
    question: '작성 중인 초대장은 어떻게 저장하나요?',
    answer:
      '편집 화면의 저장 기능을 이용하면 현재 작업 내용이 로그인한 사용자 본인의 Google Drive에 저장됩니다. 저장 후에는 마이페이지에서 다시 불러와 이어서 수정할 수 있습니다.',
  },
  {
    id: 'edit-after-publish',
    category: 'editing',
    question: '발행한 뒤에도 내용을 수정할 수 있나요?',
    answer:
      '네. 마이페이지에서 초대장을 다시 편집하고 저장한 뒤 재발행하면 변경한 내용을 공유 링크에 반영할 수 있습니다.',
  },
  {
    id: 'publish-link',
    category: 'publishing',
    question: '초대장 링크는 어떻게 만들 수 있나요?',
    answer:
      '초대장 편집을 마친 뒤 발행 기능을 이용하면 공유 가능한 링크가 생성됩니다. 마이페이지에서 발행 상태를 확인하고 링크를 다시 복사할 수 있습니다.',
  },
  {
    id: 'share-link',
    category: 'publishing',
    question: '카카오톡이나 메시지로 공유할 수 있나요?',
    answer:
      '네. 발행된 초대장의 공유 링크를 복사해 카카오톡이나 메시지 등 원하는 채널로 전달할 수 있습니다. 링크를 받은 사람은 별도의 로그인 없이 초대장을 확인할 수 있으므로, 공유 전에 초대장 내용을 한 번 확인해 주세요.',
  },
  {
    id: 'google-login',
    category: 'account',
    question: '왜 Google 로그인이 필요한가요?',
    answer:
      'Invia는 초대장 데이터와 업로드한 파일을 로그인한 사용자 본인의 Google Drive에 저장하기 위해 Google 로그인을 사용합니다. 연락처, 생년월일, 계좌번호 등 초대장에 입력한 개인정보를 별도의 고객 데이터베이스에 보관하지 않으며, 사용자의 이름, 이메일, 프로필 이미지와 같은 Google 프로필 정보도 수집하지 않습니다.',
  },
  {
    id: 'drive-access-range',
    category: 'account',
    question: 'Invia가 내 Google Drive의 모든 파일에 접근하나요?',
    answer:
      '아니요. Invia는 서비스가 생성한 파일에 접근할 수 있는 제한된 Google Drive 권한만 사용합니다. Invia가 생성한 전용 영역 안에서 초대장 데이터를 관리하므로, 기존에 저장되어 있던 개인 파일을 조회하거나 수정하지 않습니다.',
  },
  {
    id: 'drive-storage',
    category: 'account',
    question: '내 초대장 데이터는 어디에 저장되나요?',
    answer:
      '초대장 데이터와 업로드한 파일은 사용자의 Google Drive에 저장됩니다. 서비스는 초대장 내용을 별도의 고객 데이터베이스에 영구 저장하지 않습니다.',
  },
  {
    id: 'drive-data-safety',
    category: 'account',
    question: 'Google Drive에서 Invia가 만든 파일을 직접 수정해도 되나요?',
    answer:
      '권장하지 않습니다. 초대장 데이터는 Google Drive에 저장되므로 Invia가 생성한 폴더나 파일을 직접 수정, 이동 또는 삭제하면 초대장이 정상적으로 표시되지 않거나 다시 편집할 수 없게 될 수 있습니다. 초대장 삭제가 목적이라면 마이페이지의 삭제 기능을 이용해 주세요.',
  },
  {
    id: 'drive-storage-capacity',
    category: 'account',
    question: 'Google Drive 저장 공간이 부족하면 어떻게 되나요?',
    answer:
      'Google Drive 저장 공간이 부족하면 새 초대장을 만들거나 이미지와 오디오 파일을 업로드하고 변경 내용을 저장할 수 없습니다. Google Drive의 불필요한 파일을 정리해 여유 공간을 확보한 뒤 다시 시도해 주세요.',
  },
  {
    id: 'delete-invitation',
    category: 'account',
    question: '만든 초대장을 삭제할 수 있나요?',
    answer:
      '네. 마이페이지에서 삭제할 초대장을 선택해 제거할 수 있습니다. Google Drive에서 Invia가 생성한 해당 초대장 폴더를 직접 삭제하는 방법도 있지만, 실수로 다른 초대장이나 파일을 삭제할 수 있으므로 마이페이지의 삭제 기능을 권장합니다. 필요한 내용이 있다면 삭제 전에 별도로 확인해 주세요.',
  },
];
