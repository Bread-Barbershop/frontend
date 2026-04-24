import Link from 'next/link';

import Arrow from '@/shared/assets/icons/arrow.svg';

import type { ReactNode } from 'react';

type PolicyContent =
  | {
      id: string;
      type: 'paragraph' | 'subtitle';
      content: ReactNode;
    }
  | {
      id: string;
      type: 'list';
      items: ReactNode[];
    };

type PolicySection = {
  id: string;
  title: string;
  contents: PolicyContent[];
};

const policyInfo = {
  serviceName: 'Invia',
  title: '개인정보처리방침',
  effectiveDate: '2026년 4월 24일',
  lastUpdated: '2026년 4월 24일',
  descriptions: [
    '본 서비스(이하 “Invia”)는 이용자의 개인정보를 중요하게 생각하며 관련 법령을 준수합니다.',
    '본 방침은 서비스가 이용자의 개인정보를 어떻게 처리하는지 설명합니다.',
  ],
};

const policySections: PolicySection[] = [
  {
    id: 'processing-method',
    title: '개인정보 처리 방식',
    contents: [
      {
        id: 'no-database',
        type: 'paragraph',
        content:
          '서비스는 별도의 데이터베이스를 운영하지 않으며, 이용자의 개인정보를 자체 서버에 영구 저장하지 않습니다.',
      },
      {
        id: 'google-drive-storage',
        type: 'paragraph',
        content: (
          <>
            서비스는 Google 계정을 통한 인증 및 Google Drive 연동 기능을
            제공하며, 초대장 데이터 등 서비스 콘텐츠는{' '}
            <span className="font-semibold underline underline-offset-4">
              이용자 본인의 Google Drive
            </span>
            에 저장됩니다.
          </>
        ),
      },
    ],
  },
  {
    id: 'collected-information',
    title: '처리하는 개인정보 항목',
    contents: [
      {
        id: 'collectable-info',
        type: 'paragraph',
        content: '서비스는 다음과 같은 정보를 처리할 수 있습니다.',
      },
      {
        id: 'google-login-title',
        type: 'subtitle',
        content: 'Google OAuth 인증 및 Google Drive 권한 승인 시',
      },
      {
        id: 'google-login-list',
        type: 'list',
        items: [
          'Google OAuth 인증 및 Google Drive 연동을 위한 접근 토큰',
          'Google Drive 파일 생성·조회·수정·삭제 권한 정보',
        ],
      },
      {
        id: 'generated-info-title',
        type: 'subtitle',
        content: '서비스 이용 과정에서 처리되는 정보',
      },
      {
        id: 'generated-info-list',
        type: 'list',
        items: [
          '이용자가 직접 입력한 초대장 콘텐츠(예: 전화번호, 계좌번호, 메시지, 일정·장소 정보)',
          '서비스 운영에 필요한 최소한의 접속·인증 정보(세션/쿠키 등)',
        ],
      },
      {
        id: 'log-policy',
        type: 'paragraph',
        content:
          '이용자가 입력한 전화번호·계좌번호 등 콘텐츠 본문은 별도 고객 DB로 수집·축적하지 않으며, 애플리케이션 코드는 해당 본문을 의도적으로 로그에 저장하지 않습니다.',
      },
    ],
  },
  {
    id: 'purpose',
    title: '개인정보의 처리 목적',
    contents: [
      {
        id: 'purpose-intro',
        type: 'paragraph',
        content: '서비스는 다음 목적을 위해 개인정보를 처리합니다.',
      },
      {
        id: 'purpose-list',
        type: 'list',
        items: [
          'Google OAuth 인증 및 Google Drive 권한 승인',
          '이용자 요청에 따른 Google Drive 파일 생성·조회·수정·삭제 기능 제공',
          '초대장 작성/공유 등 서비스 핵심 기능 제공',
          '서비스 안정성 유지 및 장애 대응',
        ],
      },
    ],
  },
  {
    id: 'storage',
    title: '데이터 저장 위치 및 보유 기간',
    contents: [
      {
        id: 'storage-list',
        type: 'list',
        items: [
          '초대장 데이터 등 주요 콘텐츠는 이용자의 Google Drive에 저장됩니다.',
          '서비스는 이용자 개인정보를 자체 서버 DB에 별도로 영구 저장하지 않습니다.',
          '이용자가 Google Drive에서 파일을 삭제하거나 계정 연동을 해제하면, 해당 데이터는 서비스 접근 범위에서 제외됩니다.',
        ],
      },
    ],
  },
  {
    id: 'publishing-and-sharing',
    title: '초대장 발행 및 공유 시 공개 범위',
    contents: [
      {
        id: 'publish-intro',
        type: 'paragraph',
        content:
          '이용자가 초대장을 발행하거나 공유 기능을 사용하는 경우, 초대장 표시와 공유 미리보기 제공을 위해 일부 데이터가 링크를 가진 사람이 접근 가능한 상태로 공개될 수 있습니다.',
      },
      {
        id: 'publish-list',
        type: 'list',
        items: [
          '발행된 초대장 페이지는 링크를 가진 사람이 접근할 수 있습니다.',
          '초대장 표시를 위해 필요한 data.json, 이미지, 오디오 등 Google Drive 파일 또는 폴더에 공개 읽기 권한이 부여될 수 있습니다.',
          '공유 기능 사용 시 공유 제목, 설명, 대표 이미지, 위치 정보 등이 링크 미리보기 및 공유 기능 제공을 위해 저장·공개될 수 있습니다.',
          'Google 계정 권한 철회는 서비스의 향후 Drive 접근을 제한하지만, 이미 공개된 Drive 파일의 공개 상태를 자동으로 해제하지는 않을 수 있습니다.',
        ],
      },
    ],
  },
  {
    id: 'google-user-data',
    title: 'Google 사용자 데이터 처리',
    contents: [
      {
        id: 'google-oauth',
        type: 'paragraph',
        content:
          '서비스는 Google OAuth 동의 절차를 통해 필요한 최소 권한 범위에서만 Google 사용자 데이터에 접근합니다.',
      },
      {
        id: 'google-oauth-list',
        type: 'list',
        items: [
          'Google Drive 내 앱 동작에 필요한 파일 생성·조회·수정·삭제',
          '이용자가 요청한 기능 수행 목적 외 사용 금지',
          'Google 사용자 데이터의 판매 또는 광고 목적 이용 금지',
        ],
      },
      {
        id: 'google-policy',
        type: 'paragraph',
        content: (
          <>
            아래 내용은 OAuth scope 자체가 아니라 Google API로 받은 사용자
            데이터의 사용 및 이전 원칙에 관한 안내입니다. Invia는{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              Google API Services User Data Policy
            </a>
            의 제한적 사용 요건에 따라 Google 사용자 데이터를 서비스 기능 제공
            범위에서만 사용합니다.
          </>
        ),
      },
    ],
  },
  {
    id: 'third-party',
    title: '개인정보의 제3자 제공',
    contents: [
      {
        id: 'third-party-rule',
        type: 'paragraph',
        content:
          '서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 근거가 있거나 이용자가 사전에 동의한 경우에는 예외로 합니다.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '쿠키 및 인증 정보',
    contents: [
      {
        id: 'cookie-intro',
        type: 'paragraph',
        content:
          '서비스는 로그인 상태 유지를 위해 쿠키 또는 이에 준하는 세션 정보를 사용할 수 있습니다.',
      },
      {
        id: 'cookie-list',
        type: 'list',
        items: [
          '인증 토큰은 서비스 인증 목적에 한해 처리됩니다.',
          '이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 기능 이용이 제한될 수 있습니다.',
        ],
      },
    ],
  },
  {
    id: 'user-rights',
    title: '이용자의 권리 및 행사 방법',
    contents: [
      {
        id: 'rights-intro',
        type: 'paragraph',
        content: '이용자는 언제든지 개인정보 관련 권리를 행사할 수 있습니다.',
      },
      {
        id: 'rights-list',
        type: 'list',
        items: [
          <>
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Google 계정 권한 관리
            </a>
            에서 Invia의 Google Drive 접근 권한 철회
          </>,
          'Google Drive에서 발행된 초대장 파일 또는 폴더의 공개 권한 변경',
          '초대장 파일 삭제(이용자 Google Drive에서 직접 삭제)',
          '서비스 로그아웃 및 이용 중단',
          '문의처를 통한 개인정보 관련 권리 행사 요청',
        ],
      },
    ],
  },
  {
    id: 'security',
    title: '개인정보 보호를 위한 조치',
    contents: [
      {
        id: 'security-intro',
        type: 'paragraph',
        content: '서비스는 개인정보 보호를 위해 다음과 같은 조치를 취합니다.',
      },
      {
        id: 'security-list',
        type: 'list',
        items: [
          'OAuth 기반 인증 적용',
          '최소 권한 원칙에 따른 Google API scope 사용',
          'HTTPS 기반 암호화 통신 적용',
          '애플리케이션 코드에서 초대장 콘텐츠 본문 로그 저장 방지',
        ],
      },
    ],
  },
  {
    id: 'privacy-owner',
    title: '개인정보 보호책임자 및 문의처',
    contents: [
      {
        id: 'owner-intro',
        type: 'paragraph',
        content:
          '개인정보 보호 관련 문의 및 권리행사 요청은 아래 연락처로 접수하실 수 있습니다.',
      },
      {
        id: 'owner-email',
        type: 'list',
        items: [
          <>
            이메일:{' '}
            <a
              href="mailto:teambread.official@gmail.com"
              className="font-medium underline underline-offset-4"
            >
              teambread.official@gmail.com
            </a>
          </>,
        ],
      },
    ],
  },
  {
    id: 'changes',
    title: '개인정보처리방침 변경',
    contents: [
      {
        id: 'changes-notice',
        type: 'paragraph',
        content:
          '본 개인정보처리방침의 내용 추가·삭제 및 수정이 있을 경우, 변경사항의 시행 7일 전부터 서비스 내 공지사항 또는 본 페이지를 통해 고지합니다. 다만 이용자 권리에 중대한 변경이 발생하는 경우 30일 전부터 고지할 수 있습니다.',
      },
      {
        id: 'changes-date',
        type: 'paragraph',
        content: '시행일: 2026년 4월 24일 / 최종 수정일: 2026년 4월 24일',
      },
    ],
  },
];

function PolicyContentBlock({ content }: { content: PolicyContent }) {
  if (content.type === 'list') {
    return (
      <ul className="ml-5 list-disc space-y-2 text-base leading-7 text-black/75">
        {content.items.map((item, index) => (
          <li key={`${content.id}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (content.type === 'subtitle') {
    return (
      <h3 className="pt-2 text-lg font-semibold leading-8 text-black/85">
        {content.content}
      </h3>
    );
  }

  return <p className="text-base leading-8 text-black/75">{content.content}</p>;
}

function PolicySectionCard({
  section,
  sectionNumber,
}: {
  section: PolicySection;
  sectionNumber: number;
}) {
  return (
    <section className="w-full rounded-lg border border-black/10 bg-white px-6 py-7 shadow-sm sm:px-8">
      <h2 className="text-xl font-semibold leading-8 text-black">
        {sectionNumber}. {section.title}
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        {section.contents.map(content => (
          <PolicyContentBlock key={content.id} content={content} />
        ))}
      </div>
    </section>
  );
}

function Policy() {
  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-12 text-black sm:px-6">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="flex flex-col items-center gap-6 text-center">
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-md border border-black/30 px-4 py-2 text-sm transition-colors hover:bg-black hover:text-white"
          >
            <Arrow className="h-[10px] w-2 rotate-90 font-light" />
            <span>메인으로 돌아가기</span>
          </Link>

          <div className="flex flex-col items-center gap-3">
            <p className="text-2xl tracking-wider">{policyInfo.serviceName}</p>
            <h1 className="text-4xl font-semibold tracking-widest">
              {policyInfo.title}
            </h1>
            <div className="flex max-w-2xl flex-col gap-2 text-base leading-7 text-black/70">
              {policyInfo.descriptions.map(description => (
                <p key={description}>{description}</p>
              ))}
            </div>
          </div>

          <div className="my-2 flex items-center gap-4 anim-fade-5">
            <div className="h-px w-[60px] bg-gradient-to-r from-transparent via-black/50 to-transparent" />
            <div className="h-1.5 w-1.5 rotate-45 bg-black" />
            <div className="h-px w-[60px] bg-gradient-to-r from-transparent via-black/50 to-transparent" />
          </div>

          <p className="text-base leading-7 text-black/70 sm:text-lg">
            시행일: {policyInfo.effectiveDate} &nbsp;|&nbsp; 최종 수정:{' '}
            {policyInfo.lastUpdated}
          </p>
        </header>

        <div className="flex flex-col gap-5 pb-12">
          {policySections.map((section, index) => (
            <PolicySectionCard
              key={section.id}
              section={section}
              sectionNumber={index + 1}
            />
          ))}
        </div>
      </article>
    </main>
  );
}

export default Policy;
