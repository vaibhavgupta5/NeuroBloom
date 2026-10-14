// Geometric, clearly differentiated expression faces. Each emotion changes
// brows, eyes and mouth together; "low" intensity softens every feature.
const SKIN = "#FFD8B0";
const LINE = "#3D2B1F";

function Brows({ kind, k }) {
  const y = 62;
  const shapes = {
    happy: [`M58 ${y + 2} Q72 ${y - 6 * k} 86 ${y + 2}`, `M114 ${y + 2} Q128 ${y - 6 * k} 142 ${y + 2}`],
    calm: [`M58 ${y + 2} Q72 ${y - 2} 86 ${y + 2}`, `M114 ${y + 2} Q128 ${y - 2} 142 ${y + 2}`],
    sad: [`M58 ${y + 4} L86 ${y - 8 * k}`, `M114 ${y - 8 * k} L142 ${y + 4}`],
    angry: [`M58 ${y - 6 * k} L88 ${y + 8 * k}`, `M112 ${y + 8 * k} L142 ${y - 6 * k}`],
    scared: [`M58 ${y - 4 * k} Q72 ${y - 14 * k} 88 ${y - 10 * k}`, `M112 ${y - 10 * k} Q128 ${y - 14 * k} 142 ${y - 4 * k}`],
    surprised: [`M56 ${y - 6 * k} Q72 ${y - 20 * k} 88 ${y - 6 * k}`, `M112 ${y - 6 * k} Q128 ${y - 20 * k} 144 ${y - 6 * k}`],
  };
  return shapes[kind].map((d, i) => <path key={i} d={d} stroke={LINE} strokeWidth="6" strokeLinecap="round" fill="none" />);
}

function Eyes({ kind, k }) {
  const L = 72;
  const R = 128;
  const y = 86;
  if (kind === "happy") {
    return [L, R].map((x) => <path key={x} d={`M${x - 11} ${y + 2} Q${x} ${y - 10 * k - 2} ${x + 11} ${y + 2}`} stroke={LINE} strokeWidth="6" strokeLinecap="round" fill="none" />);
  }
  if (kind === "calm") {
    return [L, R].map((x) => <path key={x} d={`M${x - 10} ${y} Q${x} ${y + 6} ${x + 10} ${y}`} stroke={LINE} strokeWidth="5" strokeLinecap="round" fill="none" />);
  }
  if (kind === "scared" || kind === "surprised") {
    const r = 9 + 5 * k;
    return [L, R].map((x) => (
      <g key={x}>
        <circle cx={x} cy={y} r={r} fill="#fff" stroke={LINE} strokeWidth="4" />
        <circle cx={x} cy={y + (kind === "scared" ? 2 : 0)} r={4.5} fill={LINE} />
      </g>
    ));
  }
  if (kind === "angry") {
    return [L, R].map((x) => <ellipse key={x} cx={x} cy={y + 2} rx="8" ry={6 - 2 * k} fill={LINE} />);
  }
  return [L, R].map((x) => <ellipse key={x} cx={x} cy={y + 2} rx="7" ry="8" fill={LINE} />);
}

function Mouth({ kind, k }) {
  const y = 136;
  switch (kind) {
    case "happy":
      return k > 0.7 ? (
        <path d={`M66 ${y - 6} Q100 ${y + 40} 134 ${y - 6} Z`} fill="#7A2E2E" stroke={LINE} strokeWidth="5" strokeLinejoin="round" />
      ) : (
        <path d={`M72 ${y} Q100 ${y + 22} 128 ${y}`} stroke={LINE} strokeWidth="6" strokeLinecap="round" fill="none" />
      );
    case "sad":
      return <path d={`M72 ${y + 14} Q100 ${y - 10 * k - 4} 128 ${y + 14}`} stroke={LINE} strokeWidth="6" strokeLinecap="round" fill="none" />;
    case "angry":
      return k > 0.7 ? (
        <path d={`M70 ${y + 10} Q100 ${y - 8} 130 ${y + 10} Z`} fill="#7A2E2E" stroke={LINE} strokeWidth="5" strokeLinejoin="round" />
      ) : (
        <path d={`M74 ${y + 6} L126 ${y + 6}`} stroke={LINE} strokeWidth="6" strokeLinecap="round" />
      );
    case "scared":
      return <path d={`M78 ${y + 8} Q86 ${y - 2} 94 ${y + 8} Q100 ${y + 14} 106 ${y + 8} Q114 ${y - 2} 122 ${y + 8}`} stroke={LINE} strokeWidth="5" strokeLinecap="round" fill="none" />;
    case "surprised":
      return <ellipse cx="100" cy={y + 6} rx={9 + 5 * k} ry={12 + 8 * k} fill="#7A2E2E" stroke={LINE} strokeWidth="5" />;
    default:
      return <path d={`M82 ${y + 4} Q100 ${y + 10} 118 ${y + 4}`} stroke={LINE} strokeWidth="5" strokeLinecap="round" fill="none" />;
  }
}

export default function Face({ emotion, intensity = "high", size = 200, title }) {
  const k = intensity === "high" ? 1 : 0.55;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={title || `${emotion} face`}>
      <circle cx="100" cy="104" r="84" fill={SKIN} stroke={LINE} strokeWidth="5" />
      {(emotion === "happy" || emotion === "calm") && (
        <>
          <circle cx="56" cy="118" r="11" fill="#F7A9A0" opacity={0.6 * k} />
          <circle cx="144" cy="118" r="11" fill="#F7A9A0" opacity={0.6 * k} />
        </>
      )}
      <Brows kind={emotion} k={k} />
      <Eyes kind={emotion} k={k} />
      <Mouth kind={emotion} k={k} />
      {emotion === "sad" && k === 1 && <path d="M134 98 Q140 112 134 118 Q128 112 134 98 Z" fill="#7FB8E6" />}
    </svg>
  );
}
