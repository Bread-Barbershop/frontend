import { cn } from '@/shared/utils/cn';

interface Props {
  onColorSelect: (color: string) => void;
  selectedColor: string | null;
}

function ColorPicker({ onColorSelect, selectedColor }: Props) {
  const colors: Record<string, string>[] = [
    { black1: '#000000' },
    { black2: '#111827' },
    { black3: '#1F2937' },
    { black4: '#374151' },
    { black5: '#4B5563' },
    { black6: '#6B7280' },
    { black7: '#9CA3AF' },
    { black8: '#D1D5DB' },

    { pink1: '#4C0519' },
    { pink2: '#881337' },
    { pink3: '#9F1239' },
    { pink4: '#BE123C' },
    { pink5: '#E11D48' },
    { pink6: '#F43F5E' },
    { pink7: '#FB7185' },
    { pink8: '#FDA4AF' },

    { purple1: '#2E1065' },
    { purple2: '#4C1D95' },
    { purple3: '#5B21B6' },
    { purple4: '#6D28D9' },
    { purple5: '#7C3AED' },
    { purple6: '#8B5CF6' },
    { purple7: '#A78BFA' },
    { purple8: '#C4B5FD' },

    { blue1: '#172554' },
    { blue2: '#1E3A8A' },
    { blue3: '#1E40AF' },
    { blue4: '#1D4ED8' },
    { blue5: '#2563EB' },
    { blue6: '#3B82F6' },
    { blue7: '#60A5FA' },
    { blue8: '#93C5FD' },

    { emerald1: '#042F2E' },
    { emerald2: '#115E59' },
    { emerald3: '#0F766E' },
    { emerald4: '#0D9488' },
    { emerald5: '#14B8A6' },
    { emerald6: '#2DD4BF' },
    { emerald7: '#5EEAD4' },
    { emerald8: '#99F6E4' },

    { green1: '#052E16' },
    { green2: '#14532D' },
    { green3: '#166534' },
    { green4: '#15803D' },
    { green5: '#16A34A' },
    { green6: '#22C55E' },
    { green7: '#4ADE80' },
    { green8: '#86EFAC' },

    { yellow1: '#451A03' },
    { yellow2: '#92400E' },
    { yellow3: '#B45309' },
    { yellow4: '#D97706' },
    { yellow5: '#F59E0B' },
    { yellow6: '#FBBF24' },
    { yellow7: '#FCD34D' },
    { yellow8: '#FDE68A' },

    { orange1: '#431407' },
    { orange2: '#7C2D12' },
    { orange3: '#9A3412' },
    { orange4: '#C2410C' },
    { orange5: '#EA580C' },
    { orange6: '#F97316' },
    { orange7: '#FB923C' },
    { orange8: '#FDBA74' },

    { red1: '#450A0A' },
    { red2: '#7F1D1D' },
    { red3: '#991B1B' },
    { red4: '#B91C1C' },
    { red5: '#DC2626' },
    { red6: '#EF4444' },
    { red7: '#F87171' },
    { red8: '#FCA5A5' },
  ];
  return (
    <div
      className="flex-col items-center justify-center text-center bg-white rounded-lg"
      style={{
        padding: '14px 20px',
      }}
    >
      <p>색상</p>
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          width: 'fit-content',
        }}
      >
        {colors.map(color => {
          const [[key, value]] = Object.entries(color);
          return (
            <button
              key={key}
              className={cn(
                'block w-8 h-8 cursor-pointer',
                selectedColor === value && 'ring-2 ring-white ring-inset'
              )}
              style={{ backgroundColor: value, width: '32px', height: '32px' }}
              onClick={() => {
                onColorSelect(value);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
export default ColorPicker;
