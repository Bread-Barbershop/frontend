export const FAQ_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'getting-started', label: '시작하기' },
  { id: 'editing', label: '초대장 편집' },
  { id: 'publishing', label: '공개 및 공유' },
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

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'free-service',
    category: 'getting-started',
    question: 'Invia는 무료로 사용할 수 있나요?',
    answer:
      '네. 현재 Invia의 초대장 제작, 저장, 공개 및 공유 기능은 무료로 제공됩니다. Google 계정으로 로그인하면 바로 새 초대장을 만들 수 있습니다.',
  },
  {
    id: 'supported-devices',
    category: 'getting-started',
    question: '어떤 환경에서 초대장을 만들 수 있나요?',
    answer:
      '초대장 편집기는 PC 웹 브라우저 전용이며, 최대 1340px 너비의 편집 화면을 지원합니다. 모바일에서는 초대장을 편집할 수 없지만, 공유된 초대장은 모바일과 PC에서 모두 확인할 수 있습니다.',
  },
  {
    id: 'save-progress',
    category: 'editing',
    question: '작성 중인 초대장은 어떻게 저장하나요?',
    answer:
      '편집 화면의 저장 기능을 사용하면 현재 작업 내용이 로그인한 사용자의 Google Drive에 저장됩니다. 저장 후 마이페이지에서 다시 불러와 수정할 수 있습니다.',
  },
  {
    id: 'edit-after-public',
    category: 'editing',
    question: '공개한 뒤에도 내용을 수정할 수 있나요?',
    answer:
      '네. 마이페이지에서 초대장을 다시 편집하고 저장하면 같은 공유 링크에 변경한 내용이 반영됩니다.',
  },
  {
    id: 'share-link',
    category: 'publishing',
    question: '초대장 링크는 어떻게 공유하나요?',
    answer:
      '저장 후 마이페이지에서 초대장 카드의 URL 복사 또는 카카오톡 공유 버튼을 사용할 수 있습니다. 초대장이 비공개 상태여도 링크 복사와 공유 동작은 가능하지만, 링크를 받은 사람은 공개 전까지 초대장을 볼 수 없습니다.',
  },
  {
    id: 'visibility-toggle',
    category: 'publishing',
    question: '초대장을 공개 또는 비공개로 바꿀 수 있나요?',
    answer:
      '네. 마이페이지의 초대장 카드에서 공개/비공개 토글을 사용할 수 있습니다. 공개 상태에서는 링크를 가진 사람이 초대장을 볼 수 있고, 비공개 상태에서는 안내 화면이 표시됩니다.',
  },
  {
    id: 'google-login',
    category: 'account',
    question: '왜 Google 로그인이 필요한가요?',
    answer:
      'Invia는 초대장 데이터와 업로드한 파일을 로그인한 사용자의 Google Drive에 저장하기 위해 Google 로그인을 사용합니다. 이름, 이메일, 프로필 이미지 같은 Google 프로필 정보는 별도 고객 데이터베이스에 저장하지 않습니다.',
  },
  {
    id: 'drive-access-range',
    category: 'account',
    question: 'Invia가 제 Google Drive의 모든 파일에 접근하나요?',
    answer:
      '아니요. Invia는 서비스가 생성한 파일에 접근할 수 있는 제한된 Google Drive 권한만 사용합니다. 기존 개인 파일을 조회하거나 수정하지 않습니다.',
  },
  {
    id: 'drive-storage',
    category: 'account',
    question: '초대장 데이터는 어디에 저장되나요?',
    answer:
      '초대장 데이터와 업로드한 파일은 사용자의 Google Drive에 저장됩니다. 서비스는 초대장 내용을 별도 고객 데이터베이스에 영구 저장하지 않습니다.',
  },
  {
    id: 'drive-data-safety',
    category: 'account',
    question: 'Google Drive에서 Invia가 만든 파일을 직접 수정해도 되나요?',
    answer:
      '권장하지 않습니다. Invia가 생성한 폴더나 파일을 직접 수정, 이동, 삭제하면 초대장이 정상적으로 표시되지 않거나 다시 편집할 수 없을 수 있습니다. 초대장 삭제가 목적이라면 마이페이지의 삭제 기능을 사용해 주세요.',
  },
  {
    id: 'drive-storage-capacity',
    category: 'account',
    question: 'Google Drive 저장 공간이 부족하면 어떻게 되나요?',
    answer:
      'Google Drive 저장 공간이 부족하면 새 초대장을 만들거나 이미지와 오디오 파일을 업로드하고 저장할 수 없습니다. Drive 공간을 확보한 뒤 다시 시도해 주세요.',
  },
  {
    id: 'delete-invitation',
    category: 'account',
    question: '만든 초대장을 삭제할 수 있나요?',
    answer:
      '네. 마이페이지에서 삭제할 초대장을 선택해 제거할 수 있습니다. Drive에서 직접 폴더를 삭제할 수도 있지만 실수로 다른 초대장 파일까지 삭제할 수 있으므로 마이페이지 삭제 기능을 권장합니다.',
  },
];
