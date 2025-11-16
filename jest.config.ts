// jest.config.ts
import nextJest from 'next/jest';
import type { Config } from 'jest';

const createJestConfig = nextJest({
  dir: './', // Next.js 프로젝트 루트
});

const jestConfig: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // 절대 경로(alias) 사용 시 매핑
    '^@/(.*)$': '<rootDir>/$1',
  },
  // 커버리지 옵션 등 필요하면 추가
  coverageProvider: 'v8',
};

export default createJestConfig(jestConfig);
