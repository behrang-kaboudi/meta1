import { parse } from '@mliebelt/pgn-parser';
import { Chess } from 'chess.js';

/** SAN از نود پارسر */
const getSAN = (m) => m?.notation?.notation ?? m?.san ?? '';
/** ادغام توضیح‌ها */
const joinComment = (m) => [m?.commentMove, m?.commentAfter].filter(Boolean).join(' ').trim();

/** هش FNV-1a سبک برای id پایدار */
function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}
function makeId(parts) {
  const base = Array.isArray(parts) ? parts.join('|') : String(parts || '');
  return 'm_' + hash32(base).toString(36);
}

/**
 * یک خط را از FEN شروع اجرا و enrich می‌کند.
 * خروجی: { line, map } که map: { [id]: moveNode }
 */
function metaFromFEN(fen) {
  const parts = (fen || '').split(' ');
  // [0]=board, [1]=activeColor, [2]=castling, [3]=enPassant, [4]=halfmove, [5]=fullmove
  const side = parts[1] === 'w' ? 'w' : 'b';
  const moveNo = Number(parts[5] || 1) || 1;
  const halfmoveClock = Number(parts[4] || 0) || 0;
  return { side, moveNo, halfmoveClock };
}

function enrichLine(moves = [], fenAtStart, path = 'm.', map = {}, parent = null) {
  const chess = new Chess(fenAtStart);
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    const index = i;
    const prevMove = i > 0 ? moves[i - 1] : parent;
    // let nextMainMove = i + 1 == moves.length ? null : moves[i + 1];
    const plyBefore = chess.history().length;
    const fenBefore = chess.fen();
    const { side, moveNo } = metaFromFEN(fenBefore); // ← به‌جای history-based
    const san = getSAN(m);
    const res = chess.move(san, { sloppy: true });
    const fenAfter = chess.fen();
    const id = makeId([fenBefore, san, `${path}${i}`, String(plyBefore + 1)]);
    const en = {
      id,
      index,
      // preMove,
      // nextMainMove,
      line: moves,
      parent: prevMove,
      path: `${path}${i}`,
      plyInLine: plyBefore + 1,
      moveNo, // ← از FEN
      side, // ← از FEN
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
      variations: undefined,
    };

    m.enriched = en;
    map[id] = m;

    // زیرشاخه‌ها از همان وضعیتِ قبلِ این حرکت شروع می‌شوند (درست است)
    const vlines = Array.isArray(m?.variations) ? m.variations : [];
    if (vlines.length > 0) {
      en.variations = vlines.map((vMoves, rIdx) => {
        const sub = enrichLine(vMoves, fenBefore, `${path}${i}v${rIdx}.`, map, m);
        return sub.line;
      });
    }
  }
  return { line: moves, map };
}

/** PGN → 

 * ورودی تابع: متن 
 * PGN
 *یک یا چند بخشی
 .  ولی حتما باید یک بازی ارسال شود زیرا دچار مشکل میشویم. اگر نتواند بازی را پارس کند مقدار فالس را برمیگرداند
 *  * @returns {Object}
// let out = {
//   game: {
//     tags: {
//       // always will have start game Position
//       FEN: 'init FEN',
//     },
//     // game or variant has its own array of move objects
//     // moves: [m1,m2],
//     moves: [
//       {
//         // enriched: {
//         //   id,
//         //   preMove,
//         //   nextMainMove,
//         //   line: moves,
//         //   moveNo, // ← از FEN
//         //   side, // ← از FEN
//         //   san,
//         //   comment: joinComment(m),
//         //   nags: Array.isArray(m?.nag) ? m.nag : m?.nag ? [m.nag] : m?.nags || [],
//         //   from: res?.from ?? null,
//         //   to: res?.to ?? null,
//         //   piece: res?.piece ?? null,
//         //   captured: res?.captured ?? null,
//         //   promotion: res?.promotion ?? null,
//         //   flags: res?.flags ?? null,
//         //   fenBefore,
//         //   fenAfter,
//         // ************ To create next uniq ID
//         //   path: `${path}${i}`,
//         //   plyInLine: plyBefore + 1,
//         // },
//         commentDiag: '',
//         notation: {
//           fig: 'K',
//           strike: null,
//           col: 'c',
//           row: '6',
//           check: null,
//           promotion: null,
//           notation: 'Kc6',
//         },
//       },
//     ],
//   },
//   //to get fast access to moves by ID out.map[ID]
//   map: {
//     id: 'hash',
//   },
// };
*/
//TODO enrich with FEN
export function enrichPgn(pgnText = '') {
  let game = null;
  let games;
  try {
    games = parse(pgnText, { startRule: 'games' });
  } catch (e) {
    // set if we have fen
    if (pgnText?.includes('FEN')) {
      pgnText += ' *';
    } else {
      // for fen part only
      pgnText = `[FEN "${pgnText}"] *`;
    }
    try {
      games = parse(pgnText, { startRule: 'games' });
    } catch (e) {
      console.warn('[enrichPgn] parse error:', e);
      return false;
    }
  }
  if (!games) return false;
  game = games[0];
  game.tags.FEN = game.tags.FEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const { map } = enrichLine(game.moves || [], game.tags.FEN, 'm.', {});

  return { game, map };
}
// add New Move Section
function makeMoveObject({ fenBefore, move, moveIndexInLine, moveLine, path, preMove }) {
  console.log(parent);

  // { fenBefore, move, moveIndexInLine,moveLine, path }
  const chess = new Chess(fenBefore);
  const san = typeof move === 'string' ? move : move.notation?.notation;
  const res = chess.move(san, { sloppy: true });
  if (!res) throw new Error(`illegal move: ${san} after ${fenBefore}`);
  const fenAfter = chess.fen();
  const plyBefore = chess.history().length - 1;
  const id = makeId([fenBefore, san, path, String(plyBefore + 1)]);

  const enriched = {
    id,
    parent: preMove || null,
    // preMove: parent || null,
    //TODO اگر بازی خالی هم باشد آید آرایه حرکات اول ایجاد میشود یا خیر؟؟؟؟
    index: moveIndexInLine,
    line: moveLine,
    nextMainMove: null,
    path,
    plyInLine: plyBefore + 1,
    moveNo: metaFromFEN(fenBefore).moveNo,
    side: metaFromFEN(fenBefore).side,
    san,
    comment: '',
    nags: [],
    from: res.from,
    to: res.to,
    piece: res.piece,
    captured: res.captured ?? null,
    promotion: res.promotion ?? null,
    flags: res.flags,
    fenBefore,
    fenAfter,
    variations: undefined,
  };

  return {
    enriched,
    commentDiag: '',
    notation: {
      fig: san[0].toUpperCase() === san[0] ? san[0] : '',
      notation: san,
    },
    variations: [],
    moveNumber: metaFromFEN(fenBefore).moveNo,
    turn: metaFromFEN(fenBefore).side,
  };
}
function getPreMoveAnswers(moveLine, moveIndex) {
  //main answer is bigSibling other answers are in variants of big sibling
  let bigSiblingIndex = moveIndex + 1;
  let map = new Map();
  if (moveLine[bigSiblingIndex]) {
    map.set(moveLine[bigSiblingIndex].enriched.san, moveLine[bigSiblingIndex]);
    moveLine[bigSiblingIndex].variations.forEach((v) => {
      map.set(v[0].enriched.san, v[0]);
    });
  }
  return map;
}
/**
 * move = san
 * اگر پرنت آیدی نبود در اولین حرکت بازی جستجو کند
 */
export function addMoveAfterParent({ enrichedPgn, parentId, move }) {
  //parent means the move before new in move's line means previous move for new move
  let game = enrichedPgn.game;
  if (!game) throw new Error('game is required (from enrichPgn)');
  if (!game.moves) throw new Error('game.moves not found');
  let preMove = parentId && enrichedPgn.map[parentId];
  let preMoveIndexInLine = parentId ? preMove.enriched.index : -1;
  let preMovesline = parentId ? preMove.enriched.line : game.moves;
  let siblings = getPreMoveAnswers(preMovesline, preMoveIndexInLine);
  if (siblings.has(move)) return { enrichedPgn, existed: true, newMoveObj: siblings.get(move) };
  //set defaults for next move in line: means add new move to the end of variant. if there is no sibling
  let moveIndexInLine = preMoveIndexInLine + 1;
  let moveLine = preMovesline;
  // if we have big Sibling for our move
  if (siblings.size > 0) {
    moveIndexInLine = 0;
    moveLine = [];
    // add new line to main siblings variants
    preMovesline[preMoveIndexInLine + 1].variations.push(moveLine);
  }

  const path = preMove
    ? `${preMove.enriched.path}v${preMove.enriched.variations?.length || 0}`
    : `m.${game.moves.length}`;
  const fenBefore = preMove ? preMove.enriched.fenAfter : game.tags.FEN;

  console.log('addMoveAfterParent', { fenBefore, move, moveIndexInLine, path, preMove });

  const newMoveObj = makeMoveObject({ fenBefore, move, moveIndexInLine, moveLine, path, preMove });
  moveLine.push(newMoveObj);

  enrichedPgn.map[newMoveObj.enriched.id] = newMoveObj;

  return { enrichedPgn, existed: false, newMoveObj };
}

// فلت کردن حرکت های یک انریچ که آرایه ای از حرکات و جدا کننده واریانت
// جدا کننده واریانت  شماره واریانت داخلی را دارد و اینکه نوبت حرکت با کی شروع میشه
export function flattenMoves(enrichedPgn) {
  if (!enrichedPgn?.game?.moves) return [];
  let out = [];
  let lastRealMove = null; // always points to the last real move pushed to `out`
  let varNumber = 0;
  function recur(moves) {
    for (let m of moves) {
      const flat = {
        isLastMoveInLine: m.enriched.index === m.enriched.line.length - 1,
        isFirstMoveInLine: m.enriched.index === 0,
        isMainLine: varNumber === 0,
        varLineNumber: varNumber,
        hasVariations: Array.isArray(m.variations) && m.variations.length > 0,
        // How many ')' must be printed immediately after this move
        separatorEndCount: 0,
        // Link to the previously printed real move (used for numbering decisions)
        prevPrintedMoveRef: lastRealMove,
      };
      m.flattened = flat;
      out.push(m);
      lastRealMove = m;
      if (flat.hasVariations) {
        for (let v of m.variations) {
          varNumber++;
          recur(v);
          lastRealMove.flattened.separatorEndCount++;
          // or below is the same but with added complexity: with loop we can know where to put ')' and how many
          // out.push({ separatorEnd: true });
          varNumber--;
        }
      }
    }
  }
  recur(enrichedPgn.game.moves);
  return out;
}

export function enrichedToPgn(enrichedPgn) {
  let flat = flattenMoves(enrichedPgn);
  let out = '';
  for (let i = 0; i < flat.length; i++) {
    const m = flat[i];
    if (m.flattened.isFirstMoveInLine && !m.flattened.isMainLine) out = out.trim() + '(';

    const san = m.enriched.san;
    const cmt = pickComment(m);
    const nags = pickNags(m);
    if (m.enriched.side === 'w') {
      out += `${m.enriched.moveNo}. `;
    } else if (
      m.flattened.isFirstMoveInLine ||
      m.flattened.prevPrintedMoveRef.enriched.line !== m.enriched.line
    ) {
      out += `${m.enriched.moveNo}... `;
    }
    out += san;
    if (cmt) out += ` {${cmt}}`;
    for (const nag of nags) out += ` $${nag}`;
    if (m.flattened.isLastMoveInLine && !m.flattened.isMainLine)
      out = out.trim() + ')'.repeat(m.flattened.separatorEndCount);

    out += ' ';
  }
  console.log('flattttttoPGN', flat, out.trim());

  return out.trim();
}
// کمکی: کامنت
// TODO ساختار parser: commentMove/commentAfter
// مدیریت های زیر باید بر عهده انریچ باشد که استاندارد سازی شود
function pickComment(m) {
  if (m?.enriched?.comment) return m.enriched.comment;
  // ساختار parser: commentMove/commentAfter
  const parts = [m?.commentMove, m?.commentAfter].filter(Boolean);
  return parts.length ? parts.join(' ').trim() : '';
}

// کمکی: NAG ها را یکنواخت کن (عدد یا آرایه)
function pickNags(m) {
  const n = m?.enriched?.nags ?? m?.nag ?? m?.nags ?? [];
  return Array.isArray(n) ? n : n != null ? [n] : [];
}
