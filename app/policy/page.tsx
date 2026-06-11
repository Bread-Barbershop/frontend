import { ShieldCheck } from 'lucide-react';

import ContactEmailActions from '@/features/contact/components/ContactEmailActions';
import DashboardShell from '@/features/session/components/DashboardShell';

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
  title: '개인정보처리방침',
  effectiveDate: '2026년 4월 24일',
  lastUpdated: '2026년 6월 11일',
  descriptions: [
    'Invia는 이용자의 개인정보를 중요하게 생각하며 관련 법령을 준수합니다.',
    '본 방침은 서비스가 이용자의 개인정보와 Google Drive 데이터를 어떻게 처리하는지 설명합니다.',
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
          '서비스는 별도 고객 데이터베이스에 초대장 본문이나 개인 연락처 정보를 영구 저장하지 않습니다.',
      },
      {
        id: 'google-drive-storage',
        type: 'paragraph',
        content: (
          <>
            초대장 데이터와 업로드한 파일은{' '}
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
        id: 'google-login-title',
        type: 'subtitle',
        content: 'Google OAuth 인증 및 Drive 권한',
      },
      {
        id: 'google-login-list',
        type: 'list',
        items: [
          'Google OAuth 인증과 Drive 연동에 필요한 접근 토큰',
          '서비스가 생성한 Google Drive 파일의 생성, 조회, 수정, 삭제 권한 정보',
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
          '이용자가 직접 입력한 초대장 내용, 일정, 장소, 연락처, 메시지',
          '초대장에 업로드한 이미지, 오디오, 대표 이미지',
          '서비스 운영에 필요한 최소한의 접속 및 인증 정보',
        ],
      },
    ],
  },
  {
    id: 'purpose',
    title: '개인정보 처리 목적',
    contents: [
      {
        id: 'purpose-list',
        type: 'list',
        items: [
          'Google OAuth 인증 및 Google Drive 권한 확인',
          '이용자 요청에 따른 초대장 저장, 수정, 삭제 기능 제공',
          '초대장 공개/비공개 상태 관리',
          '초대장 공유 링크와 카카오톡 공유 미리보기 제공',
          '서비스 안정성 유지와 장애 대응',
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
          '초대장 데이터와 주요 콘텐츠는 이용자의 Google Drive에 저장됩니다.',
          '서비스는 초대장 본문을 별도 서버 DB에 영구 저장하지 않습니다.',
          '이용자가 Google Drive에서 파일을 삭제하거나 계정 연동을 해제하면, 해당 데이터는 서비스 접근 범위에서 제외됩니다.',
        ],
      },
    ],
  },
  {
    id: 'publishing-and-sharing',
    title: '초대장 공개 및 공유 시 공개 범위',
    contents: [
      {
        id: 'visibility-intro',
        type: 'paragraph',
        content:
          '이용자가 초대장을 공개로 전환하거나 공유 기능을 사용하는 경우, 초대장 표시와 공유 미리보기 제공을 위해 일부 데이터가 링크를 가진 사람이 접근 가능한 상태로 제공될 수 있습니다.',
      },
      {
        id: 'visibility-list',
        type: 'list',
        items: [
          '공개 상태의 초대장 페이지는 링크를 가진 사람이 접근할 수 있습니다.',
          '초대장 표시를 위해 필요한 data.json, 이미지, 오디오 등 Google Drive 파일 또는 폴더에 공개 읽기 권한이 부여될 수 있습니다.',
          '공유 기능 사용 시 공유 제목, 설명, 대표 이미지, 위치 정보 등이 링크 미리보기 및 공유 기능 제공을 위해 사용될 수 있습니다.',
          '마이페이지에서 초대장을 비공개로 전환하면 초대장 폴더의 공개 읽기 권한을 회수합니다.',
          'Google 계정 권한을 철회하면 서비스의 이후 Drive 접근은 제한되지만, 이미 공개로 설정된 Drive 파일 또는 폴더의 공개 상태가 자동으로 해제되지 않을 수 있습니다.',
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
        id: 'google-policy',
        type: 'paragraph',
        content: (
          <>
            Invia는{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              Google API Services User Data Policy
            </a>
            를 준수하며, Google 사용자 데이터는 서비스 기능 제공 범위에서만
            사용합니다.
          </>
        ),
      },
    ],
  },
  {
    id: 'user-rights',
    title: '이용자의 권리 및 행사 방법',
    contents: [
      {
        id: 'rights-list',
        type: 'list',
        items: [
          <a
            key="google-permissions"
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Google 계정 권한 관리에서 Invia의 Google Drive 접근 권한 철회
          </a>,
          '마이페이지에서 초대장의 공개/비공개 상태 변경',
          '마이페이지에서 초대장 삭제',
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
        id: 'security-list',
        type: 'list',
        items: [
          'OAuth 기반 인증 적용',
          '최소 권한 원칙에 따른 Google API scope 사용',
          'HTTPS 기반 통신 적용',
          '애플리케이션 코드에서 초대장 본문 로그 저장 방지',
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
          '개인정보 보호 관련 문의와 권리 행사 요청은 아래 연락처로 접수할 수 있습니다.',
      },
      {
        id: 'owner-email',
        type: 'list',
        items: [
          <a
            key="owner-email"
            href="mailto:teambread.official@gmail.com"
            className="font-medium underline underline-offset-4"
          >
            teambread.official@gmail.com
          </a>,
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
          '본 개인정보처리방침이 변경되는 경우, 변경 사항의 시행 7일 전부터 서비스 공지사항 또는 본 페이지를 통해 안내합니다. 이용자 권리에 중대한 변경이 있는 경우 30일 전부터 안내할 수 있습니다.',
      },
      {
        id: 'changes-date',
        type: 'paragraph',
        content: `시행일 ${policyInfo.effectiveDate} / 최종 수정일 ${policyInfo.lastUpdated}`,
      },
    ],
  },
];

function PolicyContentBlock({ content }: { content: PolicyContent }) {
  if (content.type === 'list') {
    return (
      <ul className="ml-5 list-disc space-y-2 text-sm leading-7 text-black/65 marker:text-black/30 sm:text-base sm:leading-8">
        {content.items.map((item, index) => (
          <li key={`${content.id}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (content.type === 'subtitle') {
    return (
      <h3 className="pt-3 text-base font-semibold leading-7 tracking-[-0.02em] text-black/85 sm:text-lg sm:leading-8">
        {content.content}
      </h3>
    );
  }

  return (
    <p className="text-sm leading-7 text-black/65 sm:text-base sm:leading-8">
      {content.content}
    </p>
  );
}

function PolicySectionCard({
  section,
  sectionNumber,
}: {
  section: PolicySection;
  sectionNumber: number;
}) {
  return (
    <section
      id={section.id}
      className="scroll-mt-8 border-b border-black/15 py-8 first:pt-6 sm:py-10 sm:first:pt-8"
    >
      <div className="flex items-start gap-4 sm:gap-7">
        <span className="pt-1 text-xs font-bold tabular-nums tracking-[0.16em] text-black/35">
          {String(sectionNumber).padStart(2, '0')}
        </span>
        <h2 className="text-xl font-semibold leading-8 tracking-[-0.04em] text-black sm:text-2xl">
          {section.title}
        </h2>
      </div>
      <div className="mt-5 flex flex-col gap-3 pl-8 sm:mt-6 sm:gap-4 sm:pl-14">
        {section.contents.map(content => (
          <PolicyContentBlock key={content.id} content={content} />
        ))}
      </div>
    </section>
  );
}

export default function Policy() {
  return (
    <DashboardShell>
      <article className="w-full px-5 pb-16 pt-12 text-[#171717] sm:px-8 lg:px-12 lg:pb-20 lg:pt-16">
        <div className="mx-auto max-w-6xl">
          <section className="grid gap-8 border-b border-black/15 pb-10 lg:grid-cols-[1fr_360px] lg:items-end lg:gap-16 lg:pb-14">
            <div>
              <p className="mb-5 text-xs font-bold tracking-[0.24em] text-black/45">
                PRIVACY & DATA
              </p>
              <h1 className="max-w-3xl text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.9]">
                Privacy,
                <br />
                clearly.
              </h1>
              <p className="mt-7 text-base font-semibold leading-7 tracking-[-0.03em] sm:text-lg sm:leading-8">
                {policyInfo.title}
              </p>
            </div>

            <div className="border-t border-black pt-5">
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-black/45">
                <ShieldCheck className="h-4 w-4" />
                EFFECTIVE DATE
              </div>
              <p className="mt-4 text-lg font-semibold tracking-[-0.03em]">
                {policyInfo.effectiveDate}
              </p>
              <p className="mt-1 text-sm leading-6 text-black/50">
                최종 수정일 {policyInfo.lastUpdated}
              </p>
            </div>
          </section>

          <section className="grid gap-10 py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-20 lg:py-14">
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <p className="text-xs font-bold tracking-[0.2em] text-black/40">
                OVERVIEW
              </p>
              <div className="mt-5 flex flex-col gap-2 text-sm leading-7 text-black/60">
                {policyInfo.descriptions.map(description => (
                  <p key={description}>{description}</p>
                ))}
              </div>

              <nav className="mt-9 hidden border-t border-black/15 pt-5 lg:block">
                <p className="text-[13px] font-bold tracking-[0.2em] text-black/40">
                  CONTENTS
                </p>
                <ol className="mt-4 flex flex-col gap-2.5">
                  {policySections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group inline-flex cursor-pointer items-start gap-2 text-[13px] leading-5 text-black/45 transition-colors hover:text-black"
                      >
                        <span className="tabular-nums text-black/30 group-hover:text-black/60">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span>{section.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <div className="border-t border-black">
              {policySections.map((section, index) => (
                <PolicySectionCard
                  key={section.id}
                  section={section}
                  sectionNumber={index + 1}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-5 border-t border-black py-9 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-black/40">
                CONTACT
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
                개인정보 처리와 관련해 궁금한 점이 있으면 문의해 주세요.
              </p>
            </div>
            <ContactEmailActions />
          </section>
        </div>
      </article>
    </DashboardShell>
  );
}
