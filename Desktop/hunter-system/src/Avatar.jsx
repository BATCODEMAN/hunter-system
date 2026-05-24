import React from "react";

export const SKIN_TONES = {
  light:      "#f5d5b0",
  medium:     "#c8a882",
  tan:        "#a0784a",
  dark:       "#6b4226",
  deep:       "#3d2010",
};

export const HAIR_COLORS = {
  black:  "#111111",
  brown:  "#5c3a1e",
  blonde: "#d4a017",
  red:    "#8b1a1a",
  white:  "#e8e8e8",
  purple: "#6a0dad",
  blue:   "#1a3a8b",
};

export const EYE_COLORS = {
  purple: "#a855f7",
  blue:   "#3b82f6",
  green:  "#22c55e",
  red:    "#ef4444",
  gold:   "#f59e0b",
  white:  "#e2e8f0",
  cyan:   "#06b6d4",
};

export const ARMOR_THEMES = {
  purple: { primary: "#534AB7", secondary: "#1a1035", accent: "#AFA9EC", aura: "#9900ff" },
  red:    { primary: "#b71a1a", secondary: "#2a0a0a", accent: "#ff6b6b", aura: "#ff0000" },
  blue:   { primary: "#1a4ab7", secondary: "#0a0a2a", accent: "#6bb3ff", aura: "#0044ff" },
  green:  { primary: "#1ab74a", secondary: "#0a2a0a", accent: "#6bff8b", aura: "#00cc44" },
  gold:   { primary: "#b7921a", secondary: "#2a1a0a", accent: "#ffd700", aura: "#ffaa00" },
  dark:   { primary: "#2a2a2a", secondary: "#0a0a0a", accent: "#888888", aura: "#444444" },
};

function getBodyConfig(bodyType, rank, goal, armorTheme = "purple") {
  const rankIndex = { E: 0, D: 1, C: 2, B: 3, A: 4, S: 5 }[rank] || 0;
  const bases = {
    very_skinny: { torsoW: 22, shoulderW: 32, armW: 6, legW: 8, bellyR: 0 },
    skinny:      { torsoW: 26, shoulderW: 36, armW: 7, legW: 9, bellyR: 0 },
    average:     { torsoW: 30, shoulderW: 42, armW: 9, legW: 11, bellyR: 2 },
    chubby:      { torsoW: 40, shoulderW: 48, armW: 13, legW: 15, bellyR: 8 },
    overweight:  { torsoW: 50, shoulderW: 54, armW: 16, legW: 18, bellyR: 14 },
  };
  const base = bases[bodyType] || bases.average;
  const muscleGain = goal === "lose_weight" ? 0.5 : 1;
  const fatLoss = goal === "build_muscle" ? 0.3 : 1;
  const torsoW = Math.min(48, base.torsoW + rankIndex * 3 * muscleGain);
  const shoulderW = Math.min(68, base.shoulderW + rankIndex * 4 * muscleGain);
  const armW = Math.min(17, base.armW + rankIndex * 1.5 * muscleGain);
  const legW = Math.min(16, base.legW + rankIndex * 1.2 * muscleGain);
  const bellyR = Math.max(0, base.bellyR - rankIndex * 2.5 * fatLoss);
  const theme = ARMOR_THEMES[armorTheme] || ARMOR_THEMES.purple;
  const rankVisuals = [
    { auraOpacity: 0, particles: 0, cape: false, shoulderPad: false, crown: false, auraSize: 0 },
    { auraOpacity: 0.15, particles: 2, cape: false, shoulderPad: false, crown: false, auraSize: 8 },
    { auraOpacity: 0.25, particles: 4, cape: false, shoulderPad: true, crown: false, auraSize: 16 },
    { auraOpacity: 0.3, particles: 6, cape: true, shoulderPad: true, crown: false, auraSize: 24 },
    { auraOpacity: 0.4, particles: 8, cape: true, shoulderPad: true, crown: false, auraSize: 32 },
    { auraOpacity: 0.55, particles: 12, cape: true, shoulderPad: true, crown: true, auraSize: 42 },
  ];
  return { ...base, torsoW, shoulderW, armW, legW, bellyR, ...rankVisuals[rankIndex], ...theme };
}

function MaleAvatar({ cfg, rank, animated, hairStyle, hairColor, eyeColor, skinTone }) {
  const cx = 100;
  const skin = SKIN_TONES[skinTone] || SKIN_TONES.medium;
  const hair = HAIR_COLORS[hairColor] || HAIR_COLORS.black;
  const eye = EYE_COLORS[eyeColor] || EYE_COLORS.purple;
  const particles = Array.from({ length: cfg.particles }, (_, i) => ({
    x: cx - 50 + Math.sin(i * 2.1) * 55, y: 185 - i * 16, size: 1.5 + (i % 3), dur: 1.8 + i * 0.25,
  }));

  function renderMaleHair() {
    switch (hairStyle) {
      case "spiky":
        return <>
          <path d={`M ${cx - 26} 66 L ${cx - 22} 44 L ${cx - 14} 58 L ${cx - 6} 40 L ${cx} 56 L ${cx + 6} 40 L ${cx + 14} 58 L ${cx + 22} 44 L ${cx + 26} 66`} fill={hair} />
          <rect x={cx - 26} y="54" width="52" height="14" rx="4" fill={hair} />
        </>;
      case "long":
        return <>
          <rect x={cx - 26} y="54" width="52" height="14" rx="8" fill={hair} />
          <path d={`M ${cx - 26} 65 Q ${cx - 40} 130 ${cx - 36} 190`} stroke={hair} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d={`M ${cx + 26} 65 Q ${cx + 40} 130 ${cx + 36} 190`} stroke={hair} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d={`M ${cx - 26} 60 Q ${cx - 18} 38 ${cx} 44 Q ${cx + 18} 38 ${cx + 26} 60`} fill={hair} />
        </>;
      case "bald":
        return null;
      case "mohawk":
        return <>
          <rect x={cx - 26} y="54" width="52" height="10" rx="4" fill={hair} />
          <rect x={cx - 6} y="30" width="12" height="30" rx="6" fill={hair} />
        </>;
      case "curly":
        return <>
          <rect x={cx - 26} y="54" width="52" height="14" rx="8" fill={hair} />
          {[-20, -10, 0, 10, 20].map(ox => (
            <circle key={ox} cx={cx + ox} cy="50" r="9" fill={hair} />
          ))}
        </>;
      default: // short
        return <>
          <path d={`M ${cx - 26} 68 Q ${cx - 20} 42 ${cx} 46 Q ${cx + 20} 42 ${cx + 26} 68 Q ${cx + 14} 50 ${cx} 50 Q ${cx - 14} 50 ${cx - 26} 68`} fill={hair} />
          <rect x={cx - 26} y="54" width="52" height="14" rx="8" fill={hair} />
        </>;
    }
  }

  return (
    <svg viewBox="0 0 200 290" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 200, filter: cfg.auraOpacity > 0 ? `drop-shadow(0 0 ${cfg.auraSize}px ${cfg.aura})` : "none" }}>
      <defs>
        <radialGradient id={`aura_m_${rank}`} cx="50%" cy="75%" r="50%">
          <stop offset="0%" stopColor={cfg.aura} stopOpacity={cfg.auraOpacity * 1.8} />
          <stop offset="100%" stopColor={cfg.aura} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow_m_${rank}`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {cfg.auraOpacity > 0 && (
        <ellipse cx={cx} cy="265" rx="65" ry="20" fill={`url(#aura_m_${rank})`}>
          {animated && <animate attributeName="ry" values="20;26;20" dur="2.5s" repeatCount="indefinite" />}
        </ellipse>
      )}
      {particles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.size} fill={cfg.aura} opacity="0.8" filter={`url(#glow_m_${rank})`}>
          {animated && <animate attributeName="cy" values={`${p.y};${p.y - 18};${p.y}`} dur={`${p.dur}s`} repeatCount="indefinite" />}
          {animated && <animate attributeName="opacity" values="0.8;0.1;0.8" dur={`${p.dur}s`} repeatCount="indefinite" />}
        </circle>
      ))}

      {cfg.cape && (
        <path d={`M ${cx - cfg.shoulderW / 2 + 4} 118 Q ${cx - 55} 190 ${cx - 40} 255 L ${cx + 40} 255 Q ${cx + 55} 190 ${cx + cfg.shoulderW / 2 - 4} 118`}
          fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" opacity="0.85" />
      )}

      {/* Legs */}
      <rect x={cx - cfg.torsoW / 2} y="200" width={cfg.torsoW / 2 - 2} height="62" rx="5" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx + 2} y="200" width={cfg.torsoW / 2 - 2} height="62" rx="5" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />
      {/* Boots */}
      <rect x={cx - cfg.torsoW / 2 - 2} y="248" width={cfg.torsoW / 2 + 2} height="16" rx="4" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx + 1} y="248" width={cfg.torsoW / 2 + 2} height="16" rx="4" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />

      {/* Arms */}
      <rect x={cx - cfg.shoulderW / 2 - cfg.armW} y="120" width={cfg.armW} height="72" rx="5" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx + cfg.shoulderW / 2} y="120" width={cfg.armW} height="72" rx="5" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />
      {/* Gloves */}
      <rect x={cx - cfg.shoulderW / 2 - cfg.armW} y="186" width={cfg.armW} height="12" rx="3" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx + cfg.shoulderW / 2} y="186" width={cfg.armW} height="12" rx="3" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />

      {/* Torso */}
      <rect x={cx - cfg.torsoW / 2} y="118" width={cfg.torsoW} height="84" rx="7" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1.5" />
      {cfg.bellyR > 0 && <ellipse cx={cx} cy="168" rx={cfg.bellyR + cfg.torsoW / 4} ry={cfg.bellyR} fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />}
      <path d={`M ${cx - cfg.torsoW / 3} 128 L ${cx} 120 L ${cx + cfg.torsoW / 3} 128 L ${cx + cfg.torsoW / 4} 158 L ${cx} 163 L ${cx - cfg.torsoW / 4} 158 Z`} fill={cfg.accent} opacity="0.45" />
      {cfg.auraOpacity > 0 && (
        <ellipse cx={cx} cy="140" rx="7" ry="9" fill={cfg.aura} opacity={cfg.auraOpacity * 2} filter={`url(#glow_m_${rank})`}>
          {animated && <animate attributeName="opacity" values={`${cfg.auraOpacity};${cfg.auraOpacity * 3};${cfg.auraOpacity}`} dur="1.8s" repeatCount="indefinite" />}
        </ellipse>
      )}
      <rect x={cx - cfg.torsoW / 2} y="194" width={cfg.torsoW} height="9" rx="2" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />

      {cfg.shoulderPad && <>
        <ellipse cx={cx - cfg.shoulderW / 2} cy="122" rx="13" ry="9" fill={cfg.accent} opacity="0.85" />
        <ellipse cx={cx + cfg.shoulderW / 2} cy="122" rx="13" ry="9" fill={cfg.accent} opacity="0.85" />
      </>}

      {/* Neck */}
      <rect x={cx - 7} y="100" width="14" height="22" rx="4" fill={skin} />
      {/* Head */}
      <rect x={cx - 26} y="54" width="52" height="52" rx="12" fill={skin} />

      {/* Hair */}
      {renderMaleHair()}

      {/* Eyes */}
      <ellipse cx={cx - 10} cy="80" rx="6" ry="6" fill="#0a0a0a" />
      <ellipse cx={cx + 10} cy="80" rx="6" ry="6" fill="#0a0a0a" />
      <ellipse cx={cx - 10} cy="80" rx="4" ry="4" fill={eye} filter={`url(#glow_m_${rank})`} />
      <ellipse cx={cx + 10} cy="80" rx="4" ry="4" fill={eye} filter={`url(#glow_m_${rank})`} />
      <circle cx={cx - 8} cy="78" r="1.5" fill="white" opacity="0.9" />
      <circle cx={cx + 12} cy="78" r="1.5" fill="white" opacity="0.9" />

      {/* Mouth */}
      <path d={`M ${cx - 8} 96 L ${cx + 8} 96`} stroke="#666" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {cfg.crown && (
        <g filter={`url(#glow_m_${rank})`}>
          <path d={`M ${cx - 22} 53 L ${cx - 16} 40 L ${cx} 48 L ${cx + 16} 40 L ${cx + 22} 53 Z`} fill={cfg.secondary} stroke={cfg.aura} strokeWidth="1.2" />
          <circle cx={cx} cy="46" r="3.5" fill={cfg.aura} />
          <circle cx={cx - 16} cy="41" r="2.5" fill={cfg.accent} />
          <circle cx={cx + 16} cy="41" r="2.5" fill={cfg.accent} />
        </g>
      )}

      <rect x={cx - 18} y="6" width="36" height="16" rx="5" fill={cfg.secondary} stroke={cfg.aura} strokeWidth="1.2" />
      <text x={cx} y="18" textAnchor="middle" fill={eye} fontSize="8" fontWeight="bold" fontFamily="sans-serif">RANK {rank}</text>
    </svg>
  );
}

function FemaleAvatar({ cfg, rank, animated, hairStyle, hairColor, eyeColor, skinTone }) {
  const cx = 100;
  const skin = SKIN_TONES[skinTone] || SKIN_TONES.medium;
  const hair = HAIR_COLORS[hairColor] || HAIR_COLORS.black;
  const eye = EYE_COLORS[eyeColor] || EYE_COLORS.purple;
  const fCfg = { ...cfg, shoulderW: cfg.shoulderW * 0.82, torsoW: cfg.torsoW * 0.88, armW: cfg.armW * 0.85 };
  const hipW = fCfg.torsoW * 1.18;
  const particles = Array.from({ length: cfg.particles }, (_, i) => ({
    x: cx - 50 + Math.sin(i * 2.1) * 55, y: 185 - i * 16, size: 1.5 + (i % 3), dur: 1.8 + i * 0.25,
  }));

  function renderFemaleHair() {
    switch (hairStyle) {
      case "short":
        return <>
          <path d={`M ${cx - 25} 72 Q ${cx - 20} 48 ${cx} 46 Q ${cx + 20} 48 ${cx + 25} 72`} fill={hair} />
          <rect x={cx - 25} y="52" width="50" height="14" rx="8" fill={hair} />
        </>;
      case "spiky":
        return <>
          <rect x={cx - 25} y="52" width="50" height="10" rx="4" fill={hair} />
          {[-16, -6, 4, 14].map((ox, i) => (
            <path key={i} d={`M ${cx + ox} 62 L ${cx + ox + 5} 40 L ${cx + ox + 10} 62`} fill={hair} />
          ))}
        </>;
      case "bun":
        return <>
          <rect x={cx - 25} y="52" width="50" height="14" rx="8" fill={hair} />
          <circle cx={cx} cy="46" r="14" fill={hair} />
          <circle cx={cx} cy="46" r="9" fill={hair} opacity="0.7" />
        </>;
      case "braid":
        return <>
          <rect x={cx - 25} y="52" width="50" height="14" rx="8" fill={hair} />
          <path d={`M ${cx - 25} 65 Q ${cx - 38} 120 ${cx - 34} 180`} stroke={hair} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d={`M ${cx + 25} 65 Q ${cx + 38} 120 ${cx + 34} 180`} stroke={hair} strokeWidth="10" fill="none" strokeLinecap="round" />
          {[0,1,2,3,4].map(i => (
            <ellipse key={i} cx={cx - 34 + (i % 2) * 4} cy={100 + i * 18} rx="5" ry="3" fill={hair} opacity="0.6" />
          ))}
        </>;
      case "curly":
        return <>
          <rect x={cx - 25} y="52" width="50" height="14" rx="8" fill={hair} />
          {[-20, -10, 0, 10, 20].map(ox => <circle key={ox} cx={cx + ox} cy="50" r="9" fill={hair} />)}
          <path d={`M ${cx - 25} 65 Q ${cx - 42} 130 ${cx - 36} 185`} stroke={hair} strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d={`M ${cx + 25} 65 Q ${cx + 42} 130 ${cx + 36} 185`} stroke={hair} strokeWidth="14" fill="none" strokeLinecap="round" />
        </>;
      default: // long
        return <>
          <path d={`M ${cx - 25} 72 Q ${cx - 30} 50 ${cx - 20} 48 Q ${cx} 42 ${cx + 20} 48 Q ${cx + 30} 50 ${cx + 25} 72`} fill={hair} />
          <rect x={cx - 25} y="52" width="50" height="14" rx="8" fill={hair} />
          <path d={`M ${cx - 25} 72 Q ${cx - 38} 120 ${cx - 34} 170`} stroke={hair} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d={`M ${cx + 25} 72 Q ${cx + 38} 120 ${cx + 34} 170`} stroke={hair} strokeWidth="10" fill="none" strokeLinecap="round" />
        </>;
    }
  }

  return (
    <svg viewBox="0 0 200 290" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 200, filter: cfg.auraOpacity > 0 ? `drop-shadow(0 0 ${cfg.auraSize}px ${cfg.aura})` : "none" }}>
      <defs>
        <radialGradient id={`aura_f_${rank}`} cx="50%" cy="75%" r="50%">
          <stop offset="0%" stopColor={cfg.aura} stopOpacity={cfg.auraOpacity * 1.8} />
          <stop offset="100%" stopColor={cfg.aura} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow_f_${rank}`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {cfg.auraOpacity > 0 && (
        <ellipse cx={cx} cy="265" rx="65" ry="20" fill={`url(#aura_f_${rank})`}>
          {animated && <animate attributeName="ry" values="20;26;20" dur="2.5s" repeatCount="indefinite" />}
        </ellipse>
      )}
      {particles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.size} fill={cfg.aura} opacity="0.8" filter={`url(#glow_f_${rank})`}>
          {animated && <animate attributeName="cy" values={`${p.y};${p.y - 18};${p.y}`} dur={`${p.dur}s`} repeatCount="indefinite" />}
          {animated && <animate attributeName="opacity" values="0.8;0.1;0.8" dur={`${p.dur}s`} repeatCount="indefinite" />}
        </circle>
      ))}

      {cfg.cape && (
        <path d={`M ${cx - fCfg.shoulderW / 2 + 4} 118 Q ${cx - 50} 190 ${cx - 38} 255 L ${cx + 38} 255 Q ${cx + 50} 190 ${cx + fCfg.shoulderW / 2 - 4} 118`}
          fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" opacity="0.85" />
      )}

      {/* Legs */}
      <rect x={cx - hipW / 2} y="200" width={hipW / 2 - 2} height="62" rx="5" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx + 2} y="200" width={hipW / 2 - 2} height="62" rx="5" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx - hipW / 2 - 1} y="248" width={hipW / 2 + 1} height="16" rx="4" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx + 1} y="248" width={hipW / 2 + 1} height="16" rx="4" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />

      {/* Arms */}
      <rect x={cx - fCfg.shoulderW / 2 - fCfg.armW} y="120" width={fCfg.armW} height="72" rx="4" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx + fCfg.shoulderW / 2} y="120" width={fCfg.armW} height="72" rx="4" fill={cfg.primary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx - fCfg.shoulderW / 2 - fCfg.armW} y="186" width={fCfg.armW} height="12" rx="3" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />
      <rect x={cx + fCfg.shoulderW / 2} y="186" width={fCfg.armW} height="12" rx="3" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />

      {/* Torso hourglass */}
      <path d={`M ${cx - fCfg.shoulderW / 2} 118 Q ${cx - fCfg.torsoW / 2 - 4} 158 ${cx - hipW / 2} 202 L ${cx + hipW / 2} 202 Q ${cx + fCfg.torsoW / 2 + 4} 158 ${cx + fCfg.shoulderW / 2} 118 Z`}
        fill={cfg.primary} stroke={cfg.accent} strokeWidth="1.5" />
      {cfg.auraOpacity > 0 && (
        <ellipse cx={cx} cy="138" rx="6" ry="7" fill={cfg.aura} opacity={cfg.auraOpacity * 2} filter={`url(#glow_f_${rank})`}>
          {animated && <animate attributeName="opacity" values={`${cfg.auraOpacity};${cfg.auraOpacity * 3};${cfg.auraOpacity}`} dur="1.8s" repeatCount="indefinite" />}
        </ellipse>
      )}
      <path d={`M ${cx - fCfg.torsoW / 3} 126 L ${cx} 119 L ${cx + fCfg.torsoW / 3} 126 L ${cx + fCfg.torsoW / 4} 150 L ${cx} 155 L ${cx - fCfg.torsoW / 4} 150 Z`}
        fill={cfg.accent} opacity="0.45" />
      <rect x={cx - hipW / 2} y="194" width={hipW} height="9" rx="2" fill={cfg.secondary} stroke={cfg.accent} strokeWidth="1" />

      {cfg.shoulderPad && <>
        <ellipse cx={cx - fCfg.shoulderW / 2} cy="122" rx="10" ry="7" fill={cfg.accent} opacity="0.85" />
        <ellipse cx={cx + fCfg.shoulderW / 2} cy="122" rx="10" ry="7" fill={cfg.accent} opacity="0.85" />
      </>}

      {/* Neck + Head */}
      <rect x={cx - 6} y="100" width="12" height="22" rx="4" fill={skin} />
      <ellipse cx={cx} cy="80" rx="25" ry="28" fill={skin} />

      {/* Hair */}
      {renderFemaleHair()}

      {/* Eyes */}
      <ellipse cx={cx - 10} cy="79" rx="6" ry="7" fill="#0a0a0a" />
      <ellipse cx={cx + 10} cy="79" rx="6" ry="7" fill="#0a0a0a" />
      <ellipse cx={cx - 10} cy="79" rx="4.5" ry="5.5" fill={eye} filter={`url(#glow_f_${rank})`} />
      <ellipse cx={cx + 10} cy="79" rx="4.5" ry="5.5" fill={eye} filter={`url(#glow_f_${rank})`} />
      <circle cx={cx - 8} cy="77" r="1.5" fill="white" opacity="0.9" />
      <circle cx={cx + 12} cy="77" r="1.5" fill="white" opacity="0.9" />
      {/* Lashes */}
      <path d={`M ${cx - 15} 73 L ${cx - 13} 70`} stroke="#0a0a0a" strokeWidth="1.2" />
      <path d={`M ${cx - 10} 72 L ${cx - 10} 69`} stroke="#0a0a0a" strokeWidth="1.2" />
      <path d={`M ${cx - 5} 73 L ${cx - 6} 70`} stroke="#0a0a0a" strokeWidth="1.2" />
      <path d={`M ${cx + 5} 73 L ${cx + 6} 70`} stroke="#0a0a0a" strokeWidth="1.2" />
      <path d={`M ${cx + 10} 72 L ${cx + 10} 69`} stroke="#0a0a0a" strokeWidth="1.2" />
      <path d={`M ${cx + 15} 73 L ${cx + 13} 70`} stroke="#0a0a0a" strokeWidth="1.2" />

      {/* Smile */}
      <path d={`M ${cx - 7} 93 Q ${cx} 98 ${cx + 7} 93`} stroke="#b07060" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {cfg.crown && (
        <g filter={`url(#glow_f_${rank})`}>
          <path d={`M ${cx - 20} 52 L ${cx - 14} 39 L ${cx} 46 L ${cx + 14} 39 L ${cx + 20} 52 Z`} fill={cfg.secondary} stroke={cfg.aura} strokeWidth="1.2" />
          <circle cx={cx} cy="44" r="3.5" fill={cfg.aura} />
          <circle cx={cx - 14} cy="40" r="2.5" fill={cfg.accent} />
          <circle cx={cx + 14} cy="40" r="2.5" fill={cfg.accent} />
        </g>
      )}

      <rect x={cx - 18} y="6" width="36" height="16" rx="5" fill={cfg.secondary} stroke={cfg.aura} strokeWidth="1.2" />
      <text x={cx} y="18" textAnchor="middle" fill={eye} fontSize="8" fontWeight="bold" fontFamily="sans-serif">RANK {rank}</text>
    </svg>
  );
}

export default function AvatarSVG({ rank = "E", bodyType = "average", goal = "both", gender = "male", animated = true, hairStyle = "short", hairColor = "black", eyeColor = "purple", skinTone = "medium", armorTheme = "purple" }) {
  const cfg = getBodyConfig(bodyType, rank, goal, armorTheme);
  return gender === "female"
    ? <FemaleAvatar cfg={cfg} rank={rank} animated={animated} hairStyle={hairStyle} hairColor={hairColor} eyeColor={eyeColor} skinTone={skinTone} />
    : <MaleAvatar cfg={cfg} rank={rank} animated={animated} hairStyle={hairStyle} hairColor={hairColor} eyeColor={eyeColor} skinTone={skinTone} />;
}