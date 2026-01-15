// eslint.config.ts
import storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  // ============================================
  // Next.js 기본 설정
  // ============================================
  // Next.js의 Core Web Vitals와 TypeScript 설정을 가장 먼저 적용
  ...nextVitals,
  ...nextTs,

  // JavaScript 권장 설정
  js.configs.recommended,

  // Prettier와 충돌하는 ESLint 규칙 비활성화
  prettierConfig,

  // ============================================
  // Storybook 전용 블록 (타입 체크 제외)
  // ============================================
  {
    files: ['.storybook/**/*.{ts,tsx}', '**/*.stories.{ts,tsx}'],
    plugins: {
      storybook,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'react/jsx-props-no-spreading': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },

  // ============================================
  // Jest/테스트 전용 블록
  // ============================================
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
        // 테스트 파일도 타입 체크가 필요하다면 project 추가 가능
        // project: './tsconfig.json',
      },
      globals: {
        // Jest 전역 변수 선언
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
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ============================================
  // 일반 코드 블록 (타입 체크 포함)
  // ============================================
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: [
      '.storybook/**/*',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/*.stories.{ts,tsx}',
    ],
    plugins: {
      import: importPlugin,
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
        // tsconfig.json을 참조하여 타입 기반 린팅 활성화
        // 이를 통해 @typescript-eslint의 고급 규칙 사용 가능
        project: './tsconfig.json',
      },
    },
    rules: {
      // ============================================
      // React 규칙
      // ============================================
      // React 17+에서는 JSX Transform으로 인해 React import 불필요
      'react/react-in-jsx-scope': 'off',

      // JSX는 .tsx, .jsx 파일에만 허용
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.tsx', '.jsx'] },
      ],

      // TypeScript를 사용하므로 PropTypes 불필요
      'react/prop-types': 'off',
      'react/require-default-props': 'off',

      // Props spreading 허용 (컴포넌트 라이브러리에서 필요)
      'react/jsx-props-no-spreading': 'off',

      // 함수형 컴포넌트 정의 방식 제한 없음 (화살표 함수, function 선언 모두 허용)
      'react/function-component-definition': 'off',

      // ============================================
      // React Hooks 규칙
      // ============================================
      // Hooks 규칙 위반은 심각한 버그를 유발하므로 에러
      'react-hooks/rules-of-hooks': 'error',
      // 의존성 배열 누락은 경고 (개발 중 유연성 제공)
      'react-hooks/exhaustive-deps': 'warn',

      // ============================================
      // Import 규칙
      // ============================================
      // 파일 확장자 규칙: JS/TS 파일은 확장자 생략 강제
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never', // .ts 확장자 생략
          tsx: 'never', // .tsx 확장자 생략
          js: 'never', // .js 확장자 생략
          jsx: 'never', // .jsx 확장자 생략
        },
      ],

      // Import 순서 정렬 규칙
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js 내장 모듈 (fs, path 등)
            'external', // node_modules의 외부 패키지
            'internal', // 프로젝트 내부 절대 경로 import
            'parent', // 상위 디렉토리 (../)
            'sibling', // 같은 디렉토리 (./)
            'index', // index 파일
            'type', // TypeScript type import
          ],
          pathGroups: [
            // @/ 경로는 internal로 취급하고 맨 앞에 배치
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          // 각 그룹 사이에 빈 줄 추가
          'newlines-between': 'always',
          // 알파벳 순서로 정렬
          alphabetize: {
            order: 'asc', // 오름차순
            caseInsensitive: true, // 대소문자 구분 안 함
          },
        },
      ],

      // 중복 import 금지
      'import/no-duplicates': 'error',

      // package.json에 없는 패키지 import 금지
      'import/no-extraneous-dependencies': [
        'error',
        {
          // 개발 의존성은 특정 파일에서만 허용
          devDependencies: [
            '**/*.test.{ts,tsx}', // 테스트 파일
            '**/*.spec.{ts,tsx}', // 스펙 파일
            '**/*.config.{js,ts,mjs}', // 설정 파일
            '**/test-utils/**', // 테스트 유틸
            '**/__tests__/**', // 테스트 디렉토리
            'jest.setup.{ts,js}', // Jest 설정
          ],
        },
      ],

      // ============================================
      // 접근성 (a11y) 규칙
      // ============================================
      // 이미지에는 alt 속성 필수 (Next.js Image 컴포넌트 포함)
      'jsx-a11y/alt-text': [
        'warn',
        {
          elements: ['img'],
          img: ['Image'], // Next.js Image 컴포넌트도 체크
        },
      ],

      // Next.js Link 컴포넌트에 대한 접근성 규칙
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'], // Link 컴포넌트 체크
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],

      // ============================================
      // TypeScript 규칙
      // ============================================
      // 기본 no-unused-vars 비활성화 (TypeScript 버전 사용)
      'no-unused-vars': 'off',

      // TypeScript 버전의 no-unused-vars
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // _로 시작하는 인자는 무시
          varsIgnorePattern: '^_', // _로 시작하는 변수는 무시
          caughtErrorsIgnorePattern: '^_', // _로 시작하는 에러는 무시
          destructuredArrayIgnorePattern: '^_', // 구조분해 시 _는 무시
        },
      ],

      // any 타입 사용 시 경고 (완전 금지하지는 않음)
      '@typescript-eslint/no-explicit-any': 'warn',

      // ============================================
      // 일반 JavaScript/TypeScript 규칙
      // ============================================
      // console 사용 경고 (warn, error, info는 허용)
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // var 키워드 사용 금지 (let, const 사용 강제)
      'no-var': 'error',

      // 재할당하지 않는 변수는 const 사용 강제
      'prefer-const': 'error',
    },
    settings: {
      // React 버전 자동 감지
      react: {
        version: 'detect',
      },

      // Import resolver 설정
      'import/resolver': {
        // TypeScript path mapping 지원
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        // Node.js 모듈 해석
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },

  // ============================================
  // 전역 무시 패턴
  // ============================================
  // 빌드 결과물, 설정 파일 등은 린트 제외
  globalIgnores([
    '.next/**', // Next.js 빌드 결과
    'out/**', // Next.js export 결과
    'build/**', // 일반 빌드 폴더
    'dist/**', // 배포용 빌드 폴더
    'node_modules/**', // 외부 패키지
    'next-env.d.ts', // Next.js 타입 정의
    '*.config.js', // JS 설정 파일
    '*.config.ts', // TS 설정 파일
    '*.config.mjs', // MJS 설정 파일
  ]),
]);
