// Схема стола: 10 мест по кругу и отдельный ведущий снизу.
// Место 1 — слева от ведущего, дальше по часовой стрелке, место 10 — справа от ведущего.
const SEATS = 10;
const CX = 160;
const CY = 150;
const R = 100;

export function TableDiagram({ seats = SEATS }: { seats?: 9 | 10 }) {
  const step = 360 / seats;
  const start = 90 + step / 2; // 1-е место чуть левее низа (ведущий — ровно внизу)

  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-label={`Схема стола: ${seats} игроков и ведущий`}
      className="h-auto w-full max-w-xs"
    >
      <circle cx={CX} cy={CY} r={R - 28} fill="var(--elevated)" stroke="var(--border)" strokeWidth="2" />
      {Array.from({ length: seats }, (_, i) => {
        const t = ((start + step * i) * Math.PI) / 180;
        const x = CX + R * Math.cos(t);
        const y = CY + R * Math.sin(t);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="17" fill="var(--surface)" stroke="var(--accent-text)" strokeWidth="1.5" />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontSize="14"
              fill="var(--text)"
              fontFamily="var(--font-ui), system-ui, sans-serif"
            >
              {i + 1}
            </text>
          </g>
        );
      })}
      <g>
        <rect x={CX - 38} y="282" width="76" height="30" rx="15" fill="var(--accent)" />
        <text
          x={CX}
          y="302"
          textAnchor="middle"
          fontSize="13"
          fill="var(--text)"
          fontFamily="var(--font-ui), system-ui, sans-serif"
        >
          Ведущий
        </text>
      </g>
    </svg>
  );
}
