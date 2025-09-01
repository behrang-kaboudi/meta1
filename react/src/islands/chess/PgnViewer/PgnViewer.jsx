// react/src/islands/chess/PgnViewer/PgnViewer.jsx
import React, { useMemo, useEffect } from 'react';
import { parse } from '@mliebelt/pgn-parser';
// import { enrichPgn, flattenEnriched } from '@shared/chess/enrichPgn.js';
import * as mod from '@shared/chess/enrichPgn.js';
const { enrichPgn } = mod;
import { Chess } from 'chess.js';

export default function PgnViewer({ pgnText = '', onReady, debug = false }) {
  const enriched = useMemo(() => {
    let game = null;
    try {
      const games = parse(pgnText, { startRule: 'games' });
      if (!games || games.length === 0) {
        return { game: null, startFEN: 'startpos', enrichedMoves: [] };
      }
      game = games[0];

      const startFEN = game?.tags?.SetUp === '1' && game?.tags?.FEN ? game.tags.FEN : undefined;

      const joinComment = (m) => [m?.commentMove, m?.commentAfter].filter(Boolean).join(' ').trim();

      // SAN در این پارسر معمولاً در m.notation.notation است
      const getSAN = (m) => m?.notation?.notation ?? m?.san ?? '';

      /**
       * اجرای یک خط (main یا variation) از یک FEN مشخص.
       * - روی هر حرکت، m.enriched ست می‌شود.
       * - اگر حرکتی variations دارد، برای هر خطِ variation از fenBefore همان حرکت انشعاب می‌زنیم.
       */
      const enrichLine = (moves = [], fenAtStart, path = '') => {
        const chess = new Chess(fenAtStart);
        const out = [];

        for (let i = 0; i < moves.length; i++) {
          const m = moves[i];

          const plyBefore = chess.history().length;
          const side = chess.turn(); // 'w' یا 'b'؛ کسی که الان این حرکت را بازی می‌کند
          const moveNo = Math.floor(plyBefore / 2) + 1;

          const fenBefore = chess.fen();
          const san = getSAN(m);
          const res = chess.move(san, { sloppy: true }); // اجرای حرکت
          const fenAfter = chess.fen();

          const en = {
            path: `${path}${i}`,
            plyInLine: plyBefore + 1,
            moveNo,
            side, // 'w' | 'b'
            san,
            comment: joinComment(m),
            nags: Array.isArray(m?.nag) ? m.nag : m?.nag ? [m.nag] : m?.nags || [],
            from: res?.from ?? null,
            to: res?.to ?? null,
            piece: res?.piece ?? null,
            captured: res?.captured ?? null,
            promotion: res?.promotion ?? null,
            flags: res?.flags ?? null,
            fenBefore,
            fenAfter,
            variations: undefined, // بعداً اگر داشت پر می‌کنیم
          };

          // ست روی نودِ همان حرکت (در خط اصلی یا داخل variation)
          m.enriched = en;

          // ⚠️ نکتهٔ اصلی: در @mliebelt/pgn-parser شاخه‌ها در m.variations هستند (نه m.ravs)
          const vlines = Array.isArray(m?.variations) ? m.variations : [];
          if (vlines.length > 0) {
            // هر شاخه از fenBefore همین حرکت آغاز می‌شود (alternative در همان نیم‌حرکت)
            en.variations = vlines.map((vMoves, rIdx) =>
              enrichLine(vMoves, fenBefore, `${path}${i}v${rIdx}.`),
            );
          }

          out.push(en);
        }

        return out;
      };

      const mainline = enrichLine(game.moves || [], startFEN, 'm.');
      return { game, startFEN: startFEN || 'startpos', enrichedMoves: mainline };
    } catch (e) {
      console.error('PGN parse error:', e);
      return { game, startFEN: 'startpos', enrichedMoves: [], error: String(e?.message || e) };
    }
  }, [pgnText]);

  // خروجی را به والد بده
  useEffect(() => {
    console.log(enriched);
    // onReady(enriched);
    // if (typeof onReady === 'function') {
    //   console.log(enriched);
    // }
  }, [onReady, enriched]);
  const { enrichPgn1 } = enrichPgn(pgnText);
  console.log(enriched, 'sdsd', enrichPgn1);
  // حالت مشاهدهٔ سریع برای دیباگ
  if (!debug) return null;
  return (
    <pre
      style={{
        fontSize: 12,
        padding: 12,
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'auto',
        maxHeight: 320,
      }}
    >
      {JSON.stringify(enriched, null, 2)}
    </pre>
  );
}
// ({ pgnText = '' }) {
//   const rows = useMemo(() => {
//     try {
//       const games = parse(pgnText, { startRule: 'games' });
//       if (!games?.length) return [];
//       const g = games[0];
//       console.log(g);
//       // اگر PGN با FEN شروع شود (SetUp=1) از همان FEN شروع کن
//       const startFEN = g?.tags?.SetUp === '1' && g?.tags?.FEN ? g.tags.FEN : undefined;
//       const chess = new Chess(startFEN);
//       const out = [];
//       let current = null;
//       let fullMove = 1;

//       const joinComment = (m) => [m.commentMove, m.commentAfter].filter(Boolean).join(' ').trim();

//       for (const m of g.moves || []) {
//         // فقط خط اصلی؛ واریانت‌ها (rav) را نادیده می‌گیریم
//         if (m.turn === 'w') {
//           const fenBefore = chess.fen();

//           chess.move(m.notation.notation, { sloppy: true });
//           const fenAfter = chess.fen();
//           console.log(m.notation.notation, fenAfter);
//           current = {
//             no: fullMove,
//             white: { san: m.san, fenAfter, fenBefore, note: joinComment(m) },
//             black: null,
//           };
//           out.push(current);
//         } else {
//           const fenBefore = chess.fen();
//           chess.move(m.notation.notation, { sloppy: true });
//           const fenAfter = chess.fen();
//           console.log(m.notation.notation, fenAfter);
//           if (!current) {
//             current = { no: fullMove, white: null, black: null };
//             out.push(current);
//           }
//           current.black = {
//             san: m.san,
//             fenAfter,
//             fenBefore,
//             note: joinComment(m),
//           };
//           fullMove += 1;
//         }
//       }
//       return out;
//     } catch (e) {
//       console.error('PGN parse error:', e);
//       return [];
//     }
//   }, [pgnText]);

//   const handleClick = (side, move) => {
//     if (!move) return;
//     // FEN «بعد از حرکت» را لاگ کن
//     console.log(`[${side}] ${move.san} -> FEN: ${move.fenAfter}`);
//   };
//   console.log(rows);
//   return (
//     <div style={{ padding: 16 }}>
//       <table
//         style={{
//           width: '100%',
//           borderCollapse: 'collapse',
//           fontFamily: 'ui-sans-serif, system-ui, -apple-system',
//           fontSize: 14,
//         }}
//       >
//         <thead>
//           <tr>
//             <th style={th}>#</th>
//             <th style={th}>White</th>
//             <th style={th}>Black</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((r, idx) => (
//             <tr key={idx}>
//               <td style={tdNo}>{r.no}</td>

//               <td style={td}>
//                 {r.white ? (
//                   <button
//                     onClick={() => handleClick('White', r.white)}
//                     title={r.white.note || r.white.san}
//                     style={btn}
//                   >
//                     {r.white.san}
//                   </button>
//                 ) : (
//                   ''
//                 )}
//                 {r.white?.note ? <div style={note}>{r.white.note}</div> : null}
//               </td>

//               <td style={td}>
//                 {r.black ? (
//                   <button
//                     onClick={() => handleClick('Black', r.black)}
//                     title={r.black.note || r.black.san}
//                     style={btn}
//                   >
//                     {r.black.san}
//                   </button>
//                 ) : (
//                   ''
//                 )}
//                 {r.black?.note ? <div style={note}>{r.black.note}</div> : null}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {rows.length === 0 ? (
//         <div style={{ marginTop: 12, color: 'crimson' }}>
//           No moves found (check console for parse errors).
//         </div>
//       ) : null}
//     </div>
//   );
// }

// const th = {
//   textAlign: 'left',
//   padding: '8px 10px',
//   borderBottom: '1px solid #e5e7eb',
//   color: '#111827',
//   fontWeight: 600,
//   position: 'sticky',
//   top: 0,
//   background: '#fff',
// };

// const tdNo = {
//   padding: '8px 10px',
//   borderBottom: '1px solid #f3f4f6',
//   width: 44,
//   color: '#4b5563',
// };

// const td = {
//   padding: '8px 10px',
//   borderBottom: '1px solid #f3f4f6',
//   verticalAlign: 'top',
// };

// const btn = {
//   border: '1px solid #d1d5db',
//   background: '#f9fafb',
//   padding: '2px 8px',
//   borderRadius: 6,
//   cursor: 'pointer',
// };

// const note = {
//   marginTop: 4,
//   color: '#6b7280',
//   fontSize: 12,
//   lineHeight: 1.3,
// };
