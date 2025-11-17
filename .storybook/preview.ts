import type { Preview } from '@storybook/nextjs-vite';

import '@/app/styles/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'centered', // 스토리북에서 버튼 위치
    actions: { argTypesRegex: '^on.*' }, // on으로 시작하는 이벤트 로깅
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'], // 자동 문서화 태그
};

export default preview;
