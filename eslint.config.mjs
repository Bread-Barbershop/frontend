// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import { defineConfig, globalIgnores } from 'eslint/config';

import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// ESLint 기본 권장 규칙
import js from '@eslint/js';

// Airbnb 스타일 구현을 위한 플러그인들
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

// prettier
import prettierConfig from 'eslint-config-prettier';

// ============================================
// ESLint 설정
// ============================================

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // ESLint JavaScript 권장 규칙
  js.configs.recommended,
  prettierConfig,
  {
    // 적용 대상 파일
    files: ['**/*.{js,jsx,ts,tsx}'],
    // ============================================
    // 플러그인 등록
    // ============================================
    plugins: {
      import: importPlugin,
      react: react,
      'react-hooks': reactHooks,
      '@typescript-eslint': tseslint,
    },

    // ============================================
    // 언어 설정
    // ============================================
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        // Jest 전역 변수 등록
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },

    // ============================================
    // 규칙 설정
    // ============================================
    rules: {
      // ==========================================
      // React 규칙 (6개)
      // ==========================================

      // Next.js는 자동으로 React import하므로 불필요
      'react/react-in-jsx-scope': 'off',

      // JSX는 .tsx, .jsx 파일에서만 허용
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.tsx', '.jsx'],
        },
      ],

      // TypeScript로 타입 검사하므로 prop-types 불필요
      'react/prop-types': 'off',

      // 함수 기본 매개변수 사용 권장
      'react/require-default-props': 'off',

      // Server Component, layout, page에서 props spreading 필요
      'react/jsx-props-no-spreading': [
        'warn',
        {
          html: 'enforce', // HTML 요소는 제한
          custom: 'ignore', // 커스텀 컴포넌트는 허용
          explicitSpread: 'ignore',
        },
      ],

      // 함수 선언문, 화살표 함수 모두 허용 (Next.js 유연성)
      'react/function-component-definition': 'off',

      // ==========================================
      // React Hooks 규칙 (2개)
      // ==========================================

      // Hooks는 최상위에서만 호출 (조건문, 반복문 금지)
      'react-hooks/rules-of-hooks': 'error',

      // useEffect 의존성 배열 검증
      'react-hooks/exhaustive-deps': 'warn',

      // ==========================================
      // Import 규칙 (4개)
      // ==========================================

      // TypeScript 파일은 확장자 생략
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'never',
          jsx: 'never',
        },
      ],

      // Import 순서 정렬
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js 내장 (fs, path)
            'external', // npm 패키지 (react, next)
            'internal', // @/ alias
            'parent', // ../
            'sibling', // ./
            'index', // ./index
            'type', // import type
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // 중복 import 금지
      'import/no-duplicates': 'error',

      // devDependencies import 제한
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{ts,tsx}',
            '**/*.spec.{ts,tsx}',
            '**/*.config.{js,ts,mjs}',
            '**/test-utils/**',
            '**/__tests__/**',
            'jest.setup.{ts,js}',
          ],
        },
      ],

      // ==========================================
      // 접근성 규칙 (2개)
      // ==========================================

      // img 태그에 alt 속성 필수
      'jsx-a11y/alt-text': [
        'warn',
        {
          elements: ['img'],
          img: ['Image'],
        },
      ],

      // anchor 태그 유효성 검사
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],

      // ==========================================
      // TypeScript 규칙 (3개)
      // ==========================================

      // JavaScript 기본 규칙 비활성화
      'no-unused-vars': 'off',

      // 사용하지 않는 변수 검사 (경고로 완화)
      // _로 시작하면 "의도적으로 미사용"으로 간주
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // _로 시작하면 무시
          varsIgnorePattern: '^_', // _로 시작하면 무시
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],

      // any 타입 사용 제한 (점진적 타입 적용을 위해 경고)
      '@typescript-eslint/no-explicit-any': 'warn',

      // ==========================================
      // 일반 코드 품질 규칙 (3개)
      // ==========================================

      // console.log는 경고, warn/error는 허용
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],

      // var 사용 금지 (const, let 사용)
      'no-var': 'error',

      // const 사용 권장 (재할당 없으면 const)
      'prefer-const': 'error',
    },

    // ============================================
    // 추가 설정
    // ============================================
    settings: {
      // React 버전 자동 감지
      react: {
        version: 'detect',
      },

      // Import 경로 해석
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },

  // ============================================
  // 무시할 파일/폴더
  // ============================================
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'next-env.d.ts',
    'node_modules/**',
    '*.config.js',
    '*.config.ts',
    '*.config.mjs',
  ]),
]);

export default eslintConfig;
