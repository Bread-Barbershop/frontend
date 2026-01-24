import WeddingDay from './WeddingDay';
import WeddingPreview from './WeddingPreview';

export const weddingDayDefinition = {
  viewComponent: WeddingPreview,
  editComponent: WeddingDay,
  fields: {
    weddingDay: {
      default: '2025-11-27',
      required: true,
    },
    weddingTime: {
      default: '13:00',
      required: true,
    },
    calendar: {
      default: '2025-11-27',
      required: false,
    },
    additionalContents: {
      default:
        '저희의 시작을 알리는 자리를 (행사일), (행사시간)에 마련했습니다.',
      required: false,
    },
    countDown: {
      default:
        '(신랑)과 (신부)의 특별한 약속이 이루어지기까지 (D-Day)일이 남았습니다.',
      required: false,
    },
  },
};
