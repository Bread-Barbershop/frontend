import type {
  InvitationTemplate,
  PosterElement,
  PosterTextElement,
} from '@/shared/data/invitationTemplates';

interface Props {
  template: InvitationTemplate;
}

const renderElement = (element: PosterElement, index: number) => {
  if (element.kind === 'rect') {
    return (
      <g key={`rect-${index}`}>
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={element.fill ?? 'none'}
          stroke={element.stroke ?? 'none'}
          strokeWidth={element.strokeWidth ?? 0}
        />
        {element.photoSlot && (
          <g
            transform={`translate(${element.x + element.width / 2}, ${element.y + element.height / 2})`}
            fill="none"
            stroke="#778277"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="-13"
              y="-10"
              width="26"
              height="19"
              rx="4"
              strokeWidth="2"
            />
            <path d="M-7 -10l2.2 -4h7.6l2.2 4" strokeWidth="2" />
            <circle cx="0" cy="-0.5" r="4" strokeWidth="2" />
            <text
              x="0"
              y="24"
              textAnchor="middle"
              dominantBaseline="hanging"
              fill="#778277"
              stroke="none"
              fontFamily="SUIT, sans-serif"
              fontSize="11"
            >
              사진을 넣어 주세요
            </text>
          </g>
        )}
      </g>
    );
  }

  if (element.kind === 'circle') {
    return (
      <circle
        key={`circle-${index}`}
        cx={element.x + element.width / 2}
        cy={element.y + element.height / 2}
        r={Math.min(element.width, element.height) / 2}
        fill={element.fill ?? 'none'}
        stroke={element.stroke ?? 'none'}
        strokeWidth={element.strokeWidth ?? 0}
      />
    );
  }

  if (element.kind === 'line') {
    return (
      <line
        key={`line-${index}`}
        x1={element.x}
        y1={element.y}
        x2={element.x + element.width}
        y2={element.y + element.height}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth ?? 1}
      />
    );
  }

  const textElement = element as PosterTextElement;
  const lines = textElement.text.split('\n');
  const textAnchor =
    textElement.textAlign === 'left'
      ? 'start'
      : textElement.textAlign === 'right'
        ? 'end'
        : 'middle';
  const x =
    textElement.textAlign === 'left'
      ? textElement.x
      : textElement.textAlign === 'right'
        ? textElement.x + textElement.width
        : textElement.x + textElement.width / 2;
  const lineHeight = (textElement.lineHeight ?? 1.2) * textElement.fontSize;

  return (
    <text
      key={`text-${index}`}
      x={x}
      y={textElement.y}
      textAnchor={textAnchor}
      dominantBaseline="hanging"
      fill={textElement.fill ?? '#222222'}
      stroke={textElement.stroke ?? 'none'}
      strokeWidth={textElement.strokeWidth ?? 0}
      paintOrder="stroke"
      fontFamily={textElement.fontFamily}
      fontSize={textElement.fontSize}
      fontWeight={textElement.fontWeight ?? '400'}
      letterSpacing={textElement.letterSpacing}
    >
      {lines.map((line, lineIndex) => (
        <tspan
          key={`${lineIndex}-${line}`}
          x={x}
          dy={lineIndex === 0 ? 0 : lineHeight}
        >
          {line}
        </tspan>
      ))}
    </text>
  );
};

export default function InvitationTemplatePoster({ template }: Props) {
  return (
    <svg
      viewBox={`0 0 ${template.poster.width} ${template.poster.height}`}
      role="img"
      aria-label={`${template.name} 포스터 미리보기`}
      className="block h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={template.poster.width}
        height={template.poster.height}
        fill={template.poster.background}
      />
      {template.poster.objects.map(renderElement)}
    </svg>
  );
}
