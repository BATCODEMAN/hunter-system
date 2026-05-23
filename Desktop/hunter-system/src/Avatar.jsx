import React from "react";

// Body shape configs based on body_type + level/rank
function getBodyConfig(bodyType, rank, goal) {
  const rankIndex = { E: 0, D: 1, C: 2, B: 3, A: 4, S: 5 }[rank] || 0;

  // Base body proportions per body type
  const bases = {
    very_skinny: { torsoW: 22, shoulderW: 32, armW: 6, legW: 8, bellyR: 0 },
    skinny:      { torsoW: 26, shoulderW: 36, armW: 7, legW: 9, bellyR: 0 },
    average:     { torsoW: 30, shoulderW: 42, armW: 9, legW: 11, bellyR: 2 },
    chubby:      { torsoW: 40, shoulderW: 48, armW: 13, legW: 15, bellyR: 8 },
    overweight:  { torsoW: 50, shoulderW: 54, armW: 16, legW: 18, bellyR: 14 },
  };

  const base = bases[bodyType] || bases.average;

  // How much the body changes per rank (towards goal)
  const muscleGain = goal === "lose_weight" ? 0.5 : 1;
  const fatLoss = goal === "build_muscle" ? 0.3 : 1;

  const torsoW = Math.min(48, base.torsoW + rankIndex * 3 * muscleGain);
  const shoulderW = Math.min(68, base.shoulderW + rankIndex * 4 * muscleGain);
  const armW = Math.min(17, base.armW + rankIndex * 1.5 * muscleGain);
  const legW = Math.min(16, base.legW + rankIndex * 1.2 * muscleGain);
  const bellyR = Math.max(0, base.bellyR - rankIndex * 2.5 * fatLoss);

  // Rank visual configs
  const rankVisuals = [
    { auraColor: "none", auraOpacity: 0, armorColor: "#2a2a3a", armorAccent: "#444", eyeGlow: "#6666ff", particles: 0, cape: false, shoulderPad: false, crown: false, auraSize: 0 },
    { auraColor: "#3344ff", auraOpacity: 0.15, armorColor: "#1a1a2e", armorAccent: "#334488", eyeGlow: "#4488ff", particles: 2, cape: false, shoulderPad: false, crown: false, auraSize: 8 },
    { auraColor: "#2244ff", auraOpacity: 0.25, armorColor: "#0f1020", armorAccent: "#2244aa", eyeGlow: "#44aaff", particles: 4, cape: false, shoulderPad: true, crown: false, auraSize: 16 },
    { auraColor: "#5533ff", auraOpacity: 0.3, armorColor: "#0a0a1a", armorAccent: "#5533cc", eyeGlow: "#aa44ff", particles: 6, cape: true, shoulderPad: true, crown: false, auraSize: 24 },
    { auraColor: "#7722ff", auraOpacity: 0.4, armorColor: "#050510", armorAccent: "#8833ff", eyeGlow: "#cc44ff", particles: 8, cape: true, shoulderPad: true, crown: false, auraSize: 32 },
    { auraColor: "#9900ff", auraOpacity: 0.55, armorColor: "#020205", armorAccent: "#aa00ff", eyeGlow: "#ff44ff", particles: 12, cape: true, shoulderPad: true, crown: true, auraSize: 42 },
  ];

  return { ...base, torsoW, shoulderW, armW, legW, bellyR, ...rankVisuals[rankIndex] };
}

export default function AvatarSVG({ rank = "E", bodyType = "average", goal = "both", animated = true }) {
  const cfg = getBodyConfig(bodyType, rank, goal);
  const cx = 100;

  const particles = Array.from({ length: cfg.particles }, (_, i) => ({
    x: cx - 50 + Math.sin(i * 2.1) * 55,
    y: 185 - i * 16,
    size: 1.5 + (i % 3),
    dur: 1.8 + i * 0.25,
  }));

  return (
    <svg viewBox="0 0 200 290" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 200, filter: cfg.auraOpacity > 0 ? `drop-shadow(0 0 ${cfg.auraSize}px ${cfg.auraColor})` : "none" }}>
      <defs>
        <radialGradient id={`aura_${rank}`} cx="50%" cy="75%" r="50%">
          <stop offset="0%" stopColor={cfg.auraColor} stopOpacity={cfg.auraOpacity * 1.8} />
          <stop offset="100%" stopColor={cfg.auraColor} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow_${rank}`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ground aura */}
      {cfg.auraOpacity > 0 && (
        <ellipse cx={cx} cy="265" rx="65" ry="20" fill={`url(#aura_${rank})`}>
          {animated && <animate attributeName="ry" values="20;26;20" dur="2.5s" repeatCount="indefinite" />}
        </ellipse>
      )}

      {/* Floating particles */}
      {particles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.size} fill={cfg.auraColor} opacity="0.8" filter={`url(#glow_${rank})`}>
          {animated && <animate attributeName="cy" values={`${p.y};${p.y - 18};${p.y}`} dur={`${p.dur}s`} repeatCount="indefinite" />}
          {animated && <animate attributeName="opacity" values="0.8;0.1;0.8" dur={`${p.dur}s`} repeatCount="indefinite" />}
        </circle>
      ))}

      {/* Cape */}
      {cfg.cape && (
        <path d={`M ${cx - cfg.shoulderW / 2 + 4} 118 Q ${cx - 55} 190 ${cx - 40} 255 L ${cx + 40} 255 Q ${cx + 55} 190 ${cx + cfg.shoulderW / 2 - 4} 118`}
          fill={cfg.armorColor} stroke={cfg.armorAccent} strokeWidth="1" opacity="0.85" />
      )}

      {/* Legs */}
      <rect x={cx - cfg.torsoW / 2} y="200" width={cfg.torsoW / 2 - 2} height="62" rx="5"
        fill={cfg.armorColor} stroke={cfg.armorAccent} strokeWidth="1" />
      <rect x={cx + 2} y="200" width={cfg.torsoW / 2 - 2} height="62" rx="5"
        fill={cfg.armorColor} stroke={cfg.armorAccent} strokeWidth="1" />
      {/* Boots */}
      <rect x={cx - cfg.torsoW / 2 - 2} y="248" width={cfg.torsoW / 2 + 2} height="16" rx="4"
        fill="#0a0a14" stroke={cfg.armorAccent} strokeWidth="1" />
      <rect x={cx + 1} y="248" width={cfg.torsoW / 2 + 2} height="16" rx="4"
        fill="#0a0a14" stroke={cfg.armorAccent} strokeWidth="1" />

      {/* Arms */}
      <rect x={cx - cfg.shoulderW / 2 - cfg.armW} y="120" width={cfg.armW} height="72" rx="5"
        fill={cfg.armorColor} stroke={cfg.armorAccent} strokeWidth="1" />
      <rect x={cx + cfg.shoulderW / 2} y="120" width={cfg.armW} height="72" rx="5"
        fill={cfg.armorColor} stroke={cfg.armorAccent} strokeWidth="1" />
      {/* Gloves */}
      <rect x={cx - cfg.shoulderW / 2 - cfg.armW} y="186" width={cfg.armW} height="12" rx="3"
        fill="#080810" stroke={cfg.armorAccent} strokeWidth="1" />
      <rect x={cx + cfg.shoulderW / 2} y="186" width={cfg.armW} height="12" rx="3"
        fill="#080810" stroke={cfg.armorAccent} strokeWidth="1" />

      {/* Torso */}
      <rect x={cx - cfg.torsoW / 2} y="118" width={cfg.torsoW} height="84" rx="7"
        fill={cfg.armorColor} stroke={cfg.armorAccent} strokeWidth="1.5" />

      {/* Belly (for chubby/overweight) */}
      {cfg.bellyR > 0 && (
        <ellipse cx={cx} cy="168" rx={cfg.bellyR + cfg.torsoW / 4} ry={cfg.bellyR}
          fill={cfg.armorColor} stroke={cfg.armorAccent} strokeWidth="1" />
      )}

      {/* Chest armor detail */}
      <path d={`M ${cx - cfg.torsoW / 3} 128 L ${cx} 120 L ${cx + cfg.torsoW / 3} 128 L ${cx + cfg.torsoW / 4} 158 L ${cx} 163 L ${cx - cfg.torsoW / 4} 158 Z`}
        fill={cfg.armorAccent} opacity="0.45" />

      {/* Chest orb / power core */}
      {cfg.auraOpacity > 0 && (
        <ellipse cx={cx} cy="140" rx="7" ry="9" fill={cfg.auraColor} opacity={cfg.auraOpacity * 2} filter={`url(#glow_${rank})`}>
          {animated && <animate attributeName="opacity" values={`${cfg.auraOpacity};${cfg.auraOpacity * 3};${cfg.auraOpacity}`} dur="1.8s" repeatCount="indefinite" />}
        </ellipse>
      )}

      {/* Belt */}
      <rect x={cx - cfg.torsoW / 2} y="194" width={cfg.torsoW} height="9" rx="2"
        fill="#080810" stroke={cfg.armorAccent} strokeWidth="1" />

      {/* Shoulder pads */}
      {cfg.shoulderPad && <>
        <ellipse cx={cx - cfg.shoulderW / 2} cy="122" rx="13" ry="9" fill={cfg.armorAccent} opacity="0.85" />
        <ellipse cx={cx + cfg.shoulderW / 2} cy="122" rx="13" ry="9" fill={cfg.armorAccent} opacity="0.85" />
      </>}

      {/* Neck */}
      <rect x={cx - 7} y="100" width="14" height="22" rx="4" fill="#c8a882" />

      {/* Head */}
      <ellipse cx={cx} cy="82" rx="27" ry="30" fill="#c8a882" />

      {/* Hair */}
      <path d={`M ${cx - 27} 76 Q ${cx - 18} 38 ${cx} 46 Q ${cx + 18} 38 ${cx + 27} 76 Q ${cx + 14} 52 ${cx} 50 Q ${cx - 14} 52 ${cx - 27} 76`}
        fill="#111" />
      <path d={`M ${cx - 27} 70 Q ${cx - 36} 56 ${cx - 24} 48`} fill="#111" />
      <path d={`M ${cx + 27} 70 Q ${cx + 36} 56 ${cx + 24} 48`} fill="#111" />

      {/* Eyes */}
      <ellipse cx={cx - 10} cy="82" rx="6" ry="7" fill="#0a0a0a" />
      <ellipse cx={cx + 10} cy="82" rx="6" ry="7" fill="#0a0a0a" />
      <ellipse cx={cx - 10} cy="82" rx="4" ry="5" fill={cfg.eyeGlow} filter={`url(#glow_${rank})`} />
      <ellipse cx={cx + 10} cy="82" rx="4" ry="5" fill={cfg.eyeGlow} filter={`url(#glow_${rank})`} />
      <circle cx={cx - 8} cy="80" r="1.5" fill="white" opacity="0.9" />
      <circle cx={cx + 12} cy="80" r="1.5" fill="white" opacity="0.9" />

      {/* Determined mouth */}
      <path d={`M ${cx - 7} 97 Q ${cx} 95 ${cx + 7} 97`} stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Crown for S rank */}
      {cfg.crown && (
        <g filter={`url(#glow_${rank})`}>
          <path d={`M ${cx - 22} 53 L ${cx - 16} 40 L ${cx} 48 L ${cx + 16} 40 L ${cx + 22} 53 Z`}
            fill="#7700cc" stroke="#ff44ff" strokeWidth="1.2" />
          <circle cx={cx} cy="46" r="3.5" fill="#ff66ff" />
          <circle cx={cx - 16} cy="41" r="2.5" fill="#cc44ff" />
          <circle cx={cx + 16} cy="41" r="2.5" fill="#cc44ff" />
        </g>
      )}

      {/* Rank badge */}
      <rect x={cx - 18} y="6" width="36" height="16" rx="5"
        fill={cfg.armorColor} stroke={cfg.auraColor !== "none" ? cfg.auraColor : "#444"} strokeWidth="1.2" />
      <text x={cx} y="18" textAnchor="middle" fill={cfg.eyeGlow} fontSize="8" fontWeight="bold" fontFamily="sans-serif">
        RANK {rank}
      </text>
    </svg>
  );
}