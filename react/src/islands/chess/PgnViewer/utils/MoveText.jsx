// MoveText.jsx
import styles from './MoveText.module.css';

/**
 * Convert SAN to figurine SAN.
 * @param {string} san - e.g. "Nf3", "exd5", "O-O", "e8=Q+", "Qxd7", "Nbd7"
 * @param {{color?: 'white'|'black', addPawn?: boolean}} opts
 */
export function toFigurineSAN(san = '', opts = {}) {
  const { color = 'w', addPawn = true } = opts;

  // Unicode figurines
  const W = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' };
  const B = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
  const M = color === 'b' ? B : W;

  if (!san) return '';

  // Castle stays as-is
  if (san.startsWith('O-O')) return san;

  let fig1 = '';
  let fig2 = '';
  let out = san;

  // Replace leading piece letter (KQRBN) with figurine
  out = out.replace(/^[KQRBN]/, (m) => {
    fig1 = M[m]; // نماد رو ذخیره کن
    return ''; // جایگزین کن
  });

  // Promotion: e8=Q → e8=♕
  out = out.replace(/=([QRBN])/, (_, p1) => {
    fig2 = M[p1]; // نماد پروموشن رو ذخیره کن
    return '=';
  });

  // Optional: show pawn figurine for pawn moves (SAN without leading piece letter)
  // Examples: "e4" → "♙e4", "exd5" → "♙exd5"
  if (addPawn && /^[a-h]/.test(san) && !/^O-O/.test(san)) {
    out = { fig: M.P, text: out };
  }

  return { fig1, fig2, text: out };
}

/**
 * Span component that renders a move with figurines.
 */
export default function MoveText({
  san = '',
  color = 'w', // 'white' | 'black'  → انتخاب نماد سفید/سیاه
  addPawn = false, // نمایش نماد پیاده برای حرکت‌های پیاده

  ...rest
}) {
  const txt = toFigurineSAN(san, { color, addPawn });
  return (
    <span>
      <span style={{ fontSize: '1.4em', lineHeight: 1 }}>{txt.fig1}</span>
      <span className={`${styles.moveText}`} dir="ltr" {...rest}>
        {txt.text}
      </span>
      <span style={{ fontSize: '1.4em', lineHeight: 1 }}>{txt.fig2}</span>
    </span>
  );
}
