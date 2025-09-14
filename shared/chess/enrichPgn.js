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
    const preMove = i > 0 ? moves[i - 1] : parent;
    let nextMainMove = i + 1 == moves.length ? null : moves[i + 1];
    const plyBefore = chess.history().length;
    const fenBefore = chess.fen();
    const { side, moveNo } = metaFromFEN(fenBefore); // ← به‌جای history-based
    const san = getSAN(m);
    const res = chess.move(san, { sloppy: true });
    const fenAfter = chess.fen();
    const id = makeId([fenBefore, san, `${path}${i}`, String(plyBefore + 1)]);
    const en = {
      id,
      preMove,
      nextMainMove,
      line: moves,
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
  try {
    const games = parse(pgnText, { startRule: 'games' });
    if (!games || games.length === 0) return false;
    game = games[0];
    game.tags.FEN = game.tags.FEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    const { map } = enrichLine(game.moves || [], game.tags.FEN, 'm.', {});

    return { game, map };
  } catch (e) {
    return false;
  }
}

function makeMoveObject({ fenBefore, move, parent, game, path }) {
  const chess = new Chess(fenBefore);

  const san = typeof move === 'string' ? move : move.notation?.notation;
  const res = chess.move(san, { sloppy: true });
  if (!res) throw new Error(`illegal move: ${san} after ${fenBefore}`);

  const fenAfter = chess.fen();
  const plyBefore = chess.history().length - 1;
  const id = makeId([fenBefore, san, path, String(plyBefore + 1)]);
  let line = parent ? parent.enriched.line : game.moves;
  console.log('line', line, parent);

  const enriched = {
    id,
    parent,
    preMove: parent || null,
    //TODO اگر بازی خالی هم باشد آید آرایه حرکات اول ایجاد میشود یا خیر؟؟؟؟
    line,
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
  };
}

/**
 * move = san
 * اگر پرنت آیدی نبود در اولین حرکت بازی جستجو کند
 */
export function addMoveAfterParent({ enrichedPgn, parentId, move }) {
  let game = enrichedPgn.game;
  if (!game) throw new Error('game is required (from enrichPgn)');
  if (!game.moves) throw new Error('game.moves not found');

  let parent, fenBefore;
  if (parentId) {
    parent = enrichedPgn.map[parentId];
    if (!parent) throw new Error(`parentId=${parentId} not found`);
    fenBefore = parent.enriched.fenAfter;
  } else {
    parent = null;
    fenBefore = game?.tags?.FEN || 'startpos';
  }
  //next means Big Brother of new move
  let next;
  if (parent) {
    next = parent.enriched?.nextMainMove ?? null;
  } else {
    next = Array.isArray(game.moves) && game.moves.length > 0 ? game.moves[0] : null;
    console.log('next', next, move);
  }
  if (next?.enriched?.san === move) {
    return {
      id: next.enriched.id,
      existed: true,
    };
  }

  // ۲) بررسی واریانت‌ها
  if (Array.isArray(next?.enriched?.variations)) {
    for (const vLine of next.enriched.variations) {
      const first = vLine[0];
      if (first?.enriched?.san === move) {
        return {
          id: first.enriched.id,
          existed: true,
        };
      }
    }
  }

  const path = parent
    ? `${parent.enriched.path}v${parent.enriched.variations?.length || 0}`
    : `m.${game.moves.length}`;

  const newMoveObj = makeMoveObject({ fenBefore, move, parent, game, path });

  /// حرکتی که پوش میشود اگر در ابتدا باشد باید
  if (parent) {
    if (!next) {
      // parent آخرین حرکت → اضافه کن
      newMoveObj.enriched.line.push(newMoveObj);
    } else {
      let newLine = [newMoveObj];
      newMoveObj.enriched.line[0].variations.push(newLine);
      newMoveObj.enriched.line = newLine;
    }
  } else {
    if (!next) {
      // بازی خالی → اولین حرکت
      //TODO test

      newMoveObj.enriched.line.moves.push(newMoveObj);
    } else {
      // شروع بازی ولی next موجوده → prepend
      let newLine = [newMoveObj];
      newMoveObj.enriched.line[0].variations.push(newLine);
      newMoveObj.enriched.line = newLine;
    }
  }

  const id = newMoveObj?.enriched?.id;

  enrichedPgn.map[id] = newMoveObj;
  //TODO پی جی ان اشتباه است از محل مناسبی نمیخواند
  console.log('enrichedPgneeeee', enrichedPgn, enrichedToPgn(enrichedPgn));
  return { id, enrichedPgn, existed: false };
}

// کمکی: از FEN، نوبت و شماره حرکت را درآور
// function metaFromFEN(fen = '') {
//   const parts = fen.split(' ');
//   const side = parts[1] === 'b' ? 'b' : 'w';
//   const moveNo = Number(parts[5] || 1) || 1;
//   return { side, moveNo };
// }

// کمکی: SAN را از هر دو ساختار بگیر
function pickSAN(m) {
  return m?.enriched?.san ?? m?.notation?.notation ?? '';
}

// کمکی: کامنت
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

// کمکی: واریانت‌ها را از هر دو مسیر بگیر
function pickVariations(m) {
  return m?.enriched?.variations ?? m?.variations ?? [];
}

// کمکی: «سمتِ حرکت» و «شماره حرکت» نود
function pickSideMoveNo(m, fallback) {
  const side = m?.enriched?.side ?? m?.turn ?? fallback.side;
  const moveNo = m?.enriched?.moveNo ?? m?.moveNumber ?? fallback.moveNo;
  return { side: side === 'b' ? 'b' : 'w', moveNo: Number(moveNo) || fallback.moveNo };
}

function enrichedToPgn(enrichedPgn) {
  const { game } = enrichedPgn;
  if (!game) throw new Error('no game in enriched PGN');

  // 1) Tags — فقط تگ‌های متنی/ساده را بنویس
  let out = '';
  const tags = game.tags || {};
  const allowed = Object.entries(tags).filter(([k, v]) =>
    ['string', 'number', 'boolean'].includes(typeof v),
  );
  for (const [k, v] of allowed) {
    out += `[${k} "${String(v)}"]\n`;
  }
  out += '\n';

  // context شروع از FEN یا استارت
  const startFEN = game.tags?.FEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const { side, moveNo } = metaFromFEN(startFEN);

  // 2) Moves
  out += movesToString(game.moves || [], { next: side, moveNo });

  // 3) Result
  out += ' ' + (game.tags?.Result || '*');

  return out.trim();
}

/**
 * moves: آرایهٔ حرکت‌ها (mainline یا واریانت)
 * ctx: { next: 'w'|'b', moveNo: number } وضعیت لحظه‌ای قبل از اجرای حرکتِ بعدی
 */
function movesToString(moves, ctx) {
  let out = '';
  // کپیِ state محلی تا در recursion خراب نشود
  let next = ctx?.next ?? 'w';
  let moveNo = Number(ctx?.moveNo || 1);

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];

    // اگر enriched نبود، از ساختار parser بخوان؛ اگر هیچ نبود، رد شو
    const san = pickSAN(m);
    if (!san) continue;

    // تعیین side/moveNo برای این حرکت
    const here = pickSideMoveNo(m, { side: next, moveNo });

    // چاپ شماره حرکت
    if (here.side === 'w') {
      out += `${here.moveNo}. `;
    } else if (i === 0) {
      // اگر اولین حرکت خطْ نوبتِ سیاه است
      out += `${here.moveNo}... `;
    }

    // خود حرکت
    out += san;

    // کامنت
    const cmt = pickComment(m);
    if (cmt) out += ` {${cmt}}`;

    // NAG
    const nags = pickNags(m);
    for (const nag of nags) out += ` $${nag}`;

    out += ' ';

    // قبل از جلو بردن state، ctx آغاز واریانت را ذخیره کن
    const varCtxStart = { next: here.side, moveNo: here.moveNo };

    // واریانت‌ها (از هر دو مسیر)
    const vlist = pickVariations(m);
    if (Array.isArray(vlist) && vlist.length) {
      for (const vLine of vlist) {
        out += '(' + movesToString(vLine, varCtxStart) + ') ';
      }
    }

    // جلو بردن state اصلی پس از بازیِ این حرکت
    if (here.side === 'w') {
      next = 'b';
    } else {
      next = 'w';
      moveNo = here.moveNo + 1;
    }
  }
  return out.trim();
}
