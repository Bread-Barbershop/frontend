/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// 스토리북 Webpack 환경에서 SVG 파일들을 동적으로 불러옵니다.
// @svgr/webpack 설정으로 인해 SVG 파일들은 React 컴포넌트로 불러와집니다.
const req = (require as any).context('./', false, /\.svg$/);
const iconMap = req.keys().reduce(
  (acc: Record<string, React.FC<React.SVGProps<SVGSVGElement>>>, key: string) => {
    const iconName = key.replace('./', '').replace('.svg', '');
    const component = req(key).default;
    if (component) {
      acc[iconName] = component;
    }
    return acc;
  },
  {} as Record<string, React.FC<React.SVGProps<SVGSVGElement>>>
);

const meta: Meta = {
  title: 'Shared/Icons',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const AllIcons: StoryObj = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '24px',
        padding: '32px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        width: '900px',
      }}
    >
      {(
        Object.entries(iconMap) as [
          string,
          React.FC<React.SVGProps<SVGSVGElement>>,
        ][]
      ).map(([name, IconComponent]) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#374151',
            }}
          >
            {/* SVGR 컴포넌트로 렌더링 */}
            <IconComponent width="100%" height="100%" />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#6b7280',
              textAlign: 'center',
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={name}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};
