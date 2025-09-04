// react/src/islands/chess/PgnViewer/PgnViewer.jsx
import { memo, useMemo, useCallback, useEffect } from 'react';
import { enrichPgn, addMoveAfterParent } from '@shared/chess/enrichPgn.js';
import styles from './PgnViewer.module.css';

/** نگاشت NAGهای رایج به نماد */
const NAG_TO_SYMBOL = {
  1: '!',
  2: '?',
  3: '!!',
  4: '??',
  5: '!?',
  6: '?!',
  10: '⟳',
  14: '⟲',
  18: '↑',
  19: '→',
  20: '↗︎',
  21: '⇄',
};

function sanWithNags(move) {
  const san = move?.enriched?.san ?? move?.notation?.notation ?? '';
  const nags = (move?.enriched?.nags ?? move?.nags ?? [])
    .map((n) => NAG_TO_SYMBOL[n] ?? '')
    .join('');
  return san + nags;
}
function getComment(move) {
  const c = move?.enriched?.comment ?? move?.comment ?? '';
  return (c || '').trim();
}

function numberLabel(move) {
  const n = move?.enriched?.moveNo ?? move?.moveNumber ?? null;
  if (!n) return '…';
  return move?.enriched?.side === 'w' ? `${n}.` : '...';
}
function firstMoveLabelInVariation(move) {
  const n = move?.enriched?.moveNo ?? move?.moveNumber ?? null;
  if (move?.enriched?.side === 'w') return n ? `${n}.` : '…';
  return n ? `${n}...` : '...';
}

/** کامنت‌های همه عمق‌ها برای یک خط واریانت */
function gatherCommentsRecursive(line, set) {
  if (!Array.isArray(line)) return;
  for (const m of line) {
    const c = getComment(m);
    if (c) set.add(c);
    if (Array.isArray(m?.variations) && m.variations.length) {
      for (const sub of m.variations) gatherCommentsRecursive(sub, set);
    }
  }
}
function collectVariations(move) {
  const out = [];
  if (!Array.isArray(move?.variations)) return out;
  for (const line of move.variations) {
    if (!Array.isArray(line) || !line.length) continue;
    const comments = new Set();
    gatherCommentsRecursive(line, comments);
    out.push({ line, comments: Array.from(comments) });
  }
  return out;
}

/* ------------------- UI ------------------- */

function VariationLine({ line, onClick }) {
  if (!Array.isArray(line) || !line.length) return null;
  return (
    <>
      {line.map((m, i) => {
        const key = m?.enriched?.path ?? `mv_${i}`;
        const isFirst = i === 0;
        const prefix = isFirst
          ? firstMoveLabelInVariation(m)
          : m?.enriched?.side === 'w'
            ? numberLabel(m)
            : null;
        return (
          <span key={key} className={styles.varChunk}>
            {prefix ? <span className={styles.varNum}>{prefix}&nbsp;</span> : null}
            <span
              className={styles.varMove}
              onClick={() => onClick(m)}
              title={m?.enriched?.fenAfter || ''}
            >
              {sanWithNags(m)}
            </span>
            {Array.isArray(m?.variations) && m.variations.length
              ? m.variations.map((sub, si) => (
                  <span key={`${key}_sub_${si}`} className={styles.paren}>
                    {' ('}
                    <VariationLine line={sub} onClick={onClick} />
                    {')'}
                  </span>
                ))
              : null}{' '}
          </span>
        );
      })}
    </>
  );
}

/** ردیفِ جفتی: شماره حرکت + ستون سفید + ستون سیاه */
function RowPair({ moveNo, white, black, onClick }) {
  return (
    <div className={styles.pairRow}>
      <div className={styles.colNumber}>{moveNo ?? '…'}</div>
      <div className={styles.colMove}>
        {white ? (
          <span
            className={styles.cellBtn}
            onClick={() => onClick(white)}
            title={white?.enriched?.fenAfter || ''}
          >
            {sanWithNags(white)}
          </span>
        ) : (
          <span className={styles.ellipsis}>…</span>
        )}
      </div>
      <div className={styles.colMove}>
        {black ? (
          <span
            className={styles.cellBtn}
            onClick={() => onClick(black)}
            title={black?.enriched?.fenAfter || ''}
          >
            {sanWithNags(black)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RowVariation({ line, onClick }) {
  return (
    <div className={styles.variation}>
      (<VariationLine line={line} onClick={onClick} />)
    </div>
  );
}
function RowComment({ text, indent = 0 }) {
  if (!text) return null;
  return (
    <div className={styles.comment} style={{ marginInlineStart: indent }}>
      {text}
    </div>
  );
}

/* ------------------- Main ------------------- */

function PgnViewer({ pgnText }) {
  const game = useMemo(() => {
    try {
      return enrichPgn(pgnText) ?? { moves: [], tags: {}, gameComment: null };
    } catch {
      return { moves: [], tags: {}, gameComment: null };
    }
  }, [pgnText]);
  const moves = game?.game?.moves ?? [];
  /** ساخت «ردیف‌ها» به‌صورت جفتی (white | black)
   *  - اگر white واریانت/کامنت داشته باشد: اول ردیف سفید، بعد واریانت‌ها، سپس ردیف سیاه.
   *  - در غیر این صورت: هر دو در یک ردیف.
   */
  const rows = useMemo(() => {
    const out = [];
    for (let i = 0; i < moves.length; ) {
      const w = moves[i];
      const moveNo = w?.enriched?.moveNo ?? w?.moveNumber ?? null;
      const b = i + 1 < moves.length && moves[i + 1]?.enriched?.side === 'b' ? moves[i + 1] : null;

      const whiteHasExtras =
        !!getComment(w) || (Array.isArray(w?.variations) && w.variations.length > 0);

      if (!whiteHasExtras) {
        // هر دو در یک ردیف (خروجی مثل تصویر ۲ برای 1.e4 e5)
        out.push({
          kind: 'pair',
          key: `p_${w?.enriched?.path}_${b?.enriched?.path}`,
          moveNo,
          white: w,
          black: b,
        });

        // بعد از ردیفِ مشترک، اگر سیاه کامنت/واریانت داشت، همین‌جا بیار
        if (b) {
          const cB = getComment(b);
          if (cB)
            out.push({ kind: 'comment', key: `cb_${b?.enriched?.path}`, text: cB, indent: 0 });
          const varsB = collectVariations(b);
          varsB.forEach((v, vi) => {
            out.push({ kind: 'variation', key: `vb_${b?.enriched?.path}_${vi}`, line: v.line });
            if (v.comments.length) {
              out.push({
                kind: 'comment',
                key: `vbc_${b?.enriched?.path}_${vi}`,
                text: v.comments.join('  |  '),
                indent: 16,
              });
            }
          });
        }
        i += b ? 2 : 1;
      } else {
        // اول سفید تنها
        out.push({ kind: 'pair', key: `pw_${w?.enriched?.path}`, moveNo, white: w, black: null });
        const cW = getComment(w);
        if (cW) out.push({ kind: 'comment', key: `cw_${w?.enriched?.path}`, text: cW, indent: 0 });
        const varsW = collectVariations(w);
        varsW.forEach((v, vi) => {
          out.push({ kind: 'variation', key: `vw_${w?.enriched?.path}_${vi}`, line: v.line });
          if (v.comments.length) {
            out.push({
              kind: 'comment',
              key: `vwc_${w?.enriched?.path}_${vi}`,
              text: v.comments.join('  |  '),
              indent: 16,
            });
          }
        });

        // سپس سیاه (در ردیف جدا؛ خروجی مثل تصویر ۲ برای "… exd4")
        if (b) {
          out.push({ kind: 'pair', key: `pb_${b?.enriched?.path}`, moveNo, white: null, black: b });
          const cB = getComment(b);
          if (cB)
            out.push({ kind: 'comment', key: `cb_${b?.enriched?.path}`, text: cB, indent: 0 });
          const varsB = collectVariations(b);
          varsB.forEach((v, vi) => {
            out.push({ kind: 'variation', key: `vb_${b?.enriched?.path}_${vi}`, line: v.line });
            if (v.comments.length) {
              out.push({
                kind: 'comment',
                key: `vbc_${b?.enriched?.path}_${vi}`,
                text: v.comments.join('  |  '),
                indent: 16,
              });
            }
          });
          i += 2;
        } else {
          i += 1;
        }
      }
    }
    return out;
  }, [moves]);
  useEffect(() => {
    if (!game?.game) return;
    addMoveAfterParent({ game: game.game, parentId: 'm_j0syfo', move: 'a6' });
    addMoveAfterParent({ game: game.game, parentId: 'm_1qhagr9', move: 'a3' });
  }, [game]);

  const handleClickMove = useCallback((m) => {
    console.log(m);
    console.log('[clicked SAN]:', m?.enriched?.san || m?.notation?.notation || '');
  }, []);
  return (
    <div className={styles.viewer}>
      {game?.gameComment && <div className={styles.gameComment}>{game.gameComment}</div>}

      <div className={styles.list}>
        {rows.map((r, i) => {
          if (r.kind === 'pair')
            return (
              <RowPair
                key={r.key}
                moveNo={r.moveNo}
                white={r.white}
                black={r.black}
                onClick={handleClickMove}
              />
            );
          if (r.kind === 'comment')
            return <RowComment key={r.key} text={r.text} indent={r.indent} />;
          if (r.kind === 'variation') {
            const nextIsVf = rows[i + 1]?.kind === 'pair';
            const style = nextIsVf ? { borderBottom: '1px solid black' } : undefined;
            console.log(rows[i + 1], style);
            return (
              <div key={r.key} style={style}>
                <RowVariation line={r.line} onClick={handleClickMove} />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export default memo(PgnViewer);
