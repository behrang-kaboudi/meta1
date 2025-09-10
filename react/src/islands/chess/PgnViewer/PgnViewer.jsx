// react/src/islands/chess/PgnViewer/PgnViewer.jsx
import { memo, useMemo, useCallback, useEffect } from 'react';
import { enrichPgn, addMoveAfterParent } from '@shared/chess/enrichPgn.js';
import { sanWithNags, getComment, collectVariations } from './utils/pgnView.helpers.js';
import setTableView from './views/Table.jsx';
import setLineView from './views/Line.jsx';
import styles from './PgnViewer.module.css';
import MoveText from './utils/MoveText.jsx';

function PgnViewer({ pgnText, view = 'grid', figurines = true, figurineColor = 'auto' }) {
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
    console.log(out);

    return out;
  }, [moves]);

  const renderSAN = useCallback(
    (m) => {
      const s = sanWithNags(m); // SAN + NAG
      if (!figurines) return s;

      // انتخاب رنگ نماد: auto (مطابق حرکتِ سفید/سیاه) یا اجباراً سفید/سیاه
      const which =
        figurineColor === 'auto'
          ? m?.enriched?.side === 'b'
            ? 'b'
            : 'w'
          : figurineColor === 'black'
            ? 'b'
            : 'w';

      return toFigurineSANText(s, which);
    },
    [figurines, figurineColor],
  );

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
    <>
      <div className={styles.viewer}>
        {game?.gameComment && <div className={styles.gameComment}>{game.gameComment}</div>}
        {view === 'grid'
          ? setTableView({ rows, onClick: handleClickMove })
          : setLineView({ rows, onClick: handleClickMove })}
      </div>
      <MoveText san="Nf3" />
    </>
  );
}

export default memo(PgnViewer);
