import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * EvalGauge (vertical, two-tone per side) — JavaScript version
 *
 * Props:
 * - blackPct?: number    // 0..100 (black fill from bottom). If omitted, it is derived from `value`.
 * - value?: number       // chess eval (neg = black better, pos = white better)
 * - evalMax?: number     // |value| cap mapped to 0..100 (default 4)
 * - divisions?: number   // number of ticks (default 8 → each 12.5%)
 * - reverse?: boolean    // flips the percentage only; black stays anchored at bottom
 * - showLabels?: boolean // show labels on major ticks
 * - formatLabel?: (p)=>string // label formatter
 * - blackColors?: [string, string]   // [near-edge, far-edge] gradient
 * - whiteColors?: [string, string]   // [near-edge, far-edge] gradient
 * - animate?: boolean    // animate height changes
 * - height?: number      // component height in px (default 200)
 * - width?: number       // component width in px (default 24)
 */
export default function EvalGauge({
  blackPct,
  value = 0,
  evalMax = 4,
  divisions = 8,
  reverse = false,
  showLabels = false,
  formatLabel = (p) => `${p}%`,
  blackColors = ['#454a54ff', '#454a54ff'],
  whiteColors = ['#ffffff', '#f2f5f8'],
  animate = true,
} = {}) {
  // 1) Derive black percentage (0..100) from either prop or value.
  const blackPctRaw =
    typeof blackPct === 'number'
      ? clamp(blackPct, 0, 100)
      : (() => {
          // +eval => more white => black smaller; -eval => more black
          const v = clamp(value ?? 0, -evalMax, evalMax);
          return clamp(50 - (v / (2 * evalMax)) * 100, 0, 100);
        })();

  // 2) Keep black anchored at bottom; only flip the share when reverse is true.
  const computedBlackPct = reverse ? blackPctRaw : 100 - blackPctRaw;

  // 3) Precompute tick positions (top-based).
  const ticks = useMemo(
    () => Array.from({ length: divisions }, (_, i) => ((i + 1) / divisions) * 100),
    [divisions],
  );

  // 4) Two-tone backgrounds (white on container, black on the fill layer).
  const whiteBg = `linear-gradient(to bottom, ${whiteColors[0]} 0%, ${whiteColors[1]} 100%)`;
  const blackBg = `linear-gradient(to top, ${blackColors[0]} 0%, ${blackColors[1]} 100%)`;

  return (
    <Box
      aria-label="Evaluation gauge"
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        borderRadius: 1,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        backgroundImage: !reverse ? blackBg : whiteBg, // white side (two-tone)
        userSelect: 'none',
      }}
    >
      {/* Black fill (always anchored at bottom) */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          bottom: 0, // anchor never changes
          width: '100%',
          height: `${computedBlackPct}%`,
          backgroundImage: !reverse ? whiteBg : blackBg, // black side (two-tone)
          transition: animate ? 'height 200ms ease-out' : undefined,
          willChange: 'height',
        }}
      />

      {/* Ticks */}
      {ticks.map((pct) => {
        const isZero = pct === 50;
        return (
          <Box
            key={pct}
            component="span"
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${100 - pct}%`,
              height: 0,
              borderTop: isZero
                ? '4px solid rgba(255, 0, 0, 0.9)' // zero tick
                : '2px solid rgba(0, 0, 0, 0.51)',
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
            }}
          >
            {showLabels && (isZero || pct % 25 === 0) && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: '100%',
                  ml: 0.5,
                  top: '-0.7em',
                  whiteSpace: 'nowrap',
                  color: 'text.primary',
                }}
              >
                {formatLabel(pct)}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
