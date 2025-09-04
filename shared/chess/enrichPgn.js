// ESM module
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

function enrichLine(moves = [], fenAtStart, path = 'm.', map = {}) {
  const chess = new Chess(fenAtStart);

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];

    const plyBefore = chess.history().length;

    const fenBefore = chess.fen();
    const { side, moveNo } = metaFromFEN(fenBefore); // ← به‌جای history-based

    const san = getSAN(m);
    const res = chess.move(san, { sloppy: true });
    const fenAfter = chess.fen();

    const id = makeId([fenBefore, san, `${path}${i}`, String(plyBefore + 1)]);

    const en = {
      id,
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
        const sub = enrichLine(vMoves, fenBefore, `${path}${i}v${rIdx}.`, map);
        return sub.line;
      });
    }
  }

  return { line: moves, map };
}

/** PGN → { game, startFEN, map } */
export function enrichPgn(pgnText = '') {
  let game = null;
  try {
    const games = parse(pgnText, { startRule: 'games' });
    if (!games || games.length === 0) return { game: null, startFEN: 'startpos', map: {} };

    game = games[0];
    const startFEN = game?.tags?.SetUp === '1' && game?.tags?.FEN ? game.tags.FEN : undefined;

    const { map } = enrichLine(game.moves || [], startFEN, 'm.', {});
    game.idMap = map;

    return { game, startFEN, map };
  } catch (e) {
    return { game, error: String(e?.message || e), map: {} };
  }
}

/** نرمال‌سازی ورودی حرکت به SAN زیر یک FEN مشخص */
function normalizeIncomingMoveSpec(move, fenStart) {
  const chess = new Chess(fenStart);

  if (typeof move === 'string') {
    const res = chess.move(move, { sloppy: true });
    if (!res) throw new Error(`Invalid SAN under position: ${move}`);
    return { san: res.san, comment: '', nags: [] };
  }

  if (move && typeof move === 'object') {
    if (move.san) {
      const res = chess.move(move.san, { sloppy: true });
      if (!res) throw new Error(`Invalid SAN under position: ${move.san}`);
      return {
        san: res.san,
        comment: move.comment || '',
        nags: Array.isArray(move.nags) ? move.nags : [],
      };
    }
    if (move.from && move.to) {
      const res = chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      if (!res) throw new Error(`Invalid UCI under position: ${move.from}-${move.to}`);
      return {
        san: res.san,
        comment: move.comment || '',
        nags: Array.isArray(move.nags) ? move.nags : [],
      };
    }
  }

  throw new Error('move spec must be SAN string or { san } or { from, to, promotion? }');
}

/** یافتن آرایه خط و اندیس یک نود (id) در کل درخت */
function findLineAndIndexById(line, targetId, prefix = 'm.') {
  for (let i = 0; i < line.length; i++) {
    const m = line[i];
    if (m?.enriched?.id === targetId) return { line, index: i, pathPrefix: prefix };
    if (Array.isArray(m?.variations) && m.variations.length) {
      for (let vi = 0; vi < m.variations.length; vi++) {
        const sub = line[i].variations[vi];
        const res = findLineAndIndexById(sub, targetId, `${m.enriched.path}v${vi}.`);
        if (res) return res;
      }
    }
  }
  return null;
}
const getStartFENFromGame = (game) =>
  game?.tags?.SetUp === '1' && game?.tags?.FEN ? game.tags.FEN : undefined;

/**
 * ساخت یک نود تک‌حرکت روی FEN مشخص.
 * kind:
 *  - 'continuation': حرکت بعد از host ⇒ side = opposite(hostSide), moveNo = hostSide==='w'? hostMoveNo : hostMoveNo+1
 *  - 'variationOfHost': حرکت جایگزینِ host ⇒ side = hostSide, moveNo = hostMoveNo
 */
function createNodeFromSanAtFen({
  san,
  fenStart,
  hostSide,
  hostMoveNo,
  kind, // 'continuation' | 'variationOfHost'
  comment = '',
  nags = [],
}) {
  const chess = new Chess(fenStart);
  const res = chess.move(san, { sloppy: true });
  if (!res) throw new Error(`Invalid SAN under fen: ${san}`);

  let side, moveNo;
  if (kind === 'continuation') {
    side = hostSide === 'w' ? 'b' : 'w';
    moveNo = hostSide === 'w' ? hostMoveNo : hostMoveNo + 1;
  } else {
    side = hostSide; // جایگزین همان حرکت
    moveNo = hostMoveNo;
  }

  const node = {
    moveNumber: null,
    notation: { notation: san },
    variations: [],
    nag: null,
    commentDiag: null,
    turn: side,
  };

  // enriched موقت (پس از enrichLine بازنویسی می‌شود)
  node.enriched = {
    id: makeId([fenStart, san, 'tmp', String(Math.random())]),
    path: '',
    plyInLine: NaN,
    moveNo,
    side,
    san,
    comment,
    nags,
    from: res.from,
    to: res.to,
    piece: res.piece,
    captured: res.captured ?? null,
    promotion: res.promotion ?? null,
    flags: res.flags ?? null,
    fenBefore: fenStart,
    fenAfter: chess.fen(),
    variations: undefined,
  };

  return node;
}

/**
 * افزودن «حرکت بعد از حرکتِ مادر» با منطق مطلوب:
 * - اگر بعد از والد حرکتی نیست ⇒ ادامه لاین (index+1).
 * - اگر هست:
 *    - اگر SAN یکسان ⇒ همان id را برگردان.
 *    - اگر متفاوت ⇒ در variations حرکتِ بعدی (next) بگرد؛ اگر بود id همان، وگرنه واریانت جدید با همان SAN.
 * سپس enrichLine کل بازی اجرا می‌شود تا path/id/fen درست شوند.
 */
export function addMoveAfterParent({ game, parentId, move }) {
  if (!game) throw new Error('game is required (from enrichPgn)');
  if (!game.moves) throw new Error('game.moves not found');
  if (!game.idMap) throw new Error('game.idMap not found. Run enrichPgn first.');

  const found = findLineAndIndexById(game.moves, parentId, 'm.');
  if (!found) throw new Error(`parentId not found: ${parentId}`);

  const { line, index } = found;
  const parent = line[index];
  if (!parent?.enriched) throw new Error('parent node is not enriched');

  const fenAfterParent = parent.enriched.fenAfter;
  const spec = normalizeIncomingMoveSpec(move, fenAfterParent);
  const sanNorm = spec.san;

  const next = line[index + 1];

  // 1) ادامه لاین اگر next وجود ندارد
  if (!next) {
    const newNode = createNodeFromSanAtFen({
      san: sanNorm,
      fenStart: fenAfterParent,
      hostSide: parent.enriched.side,
      hostMoveNo: parent.enriched.moveNo,
      kind: 'continuation',
      comment: spec.comment,
      nags: spec.nags,
    });
    line.splice(index + 1, 0, newNode);

    const startFEN = getStartFENFromGame(game);
    const { map } = enrichLine(game.moves, startFEN, 'm.', {});
    game.idMap = map;

    const id = newNode?.enriched?.id;
    return { id, existed: false, kind: 'continuation', game, map };
  }

  // 2) اگر حرکت main بعدی همان SAN است
  if (next?.enriched?.san === sanNorm) {
    return { id: next.enriched.id, existed: true, kind: 'main', game, map: game.idMap };
  }

  // 3) جستجو/ساخت در واریانت‌های «حرکت بعدی»
  if (!Array.isArray(next.variations)) next.variations = [];
  for (const vLine of next.variations) {
    const first = Array.isArray(vLine) && vLine[0];
    if (first?.enriched?.san === sanNorm) {
      return { id: first.enriched.id, existed: true, kind: 'variation', game, map: game.idMap };
    }
  }

  // واریانت جدید زیر «next»، اولین عنصر = همین حرکت
  const varNode = createNodeFromSanAtFen({
    san: sanNorm,
    fenStart: next.enriched.fenBefore, // ← شروع واریانتِ next از fenBefore خودش
    hostSide: next.enriched.side, // ← جایگزینِ next ⇒ side همان sideِ next
    hostMoveNo: next.enriched.moveNo,
    kind: 'variationOfHost',
    comment: spec.comment,
    nags: spec.nags,
  });
  next.variations.push([varNode]);

  const startFEN = getStartFENFromGame(game);
  const { map } = enrichLine(game.moves, startFEN, 'm.', {});
  game.idMap = map;

  const id = varNode?.enriched?.id;
  return { id, existed: false, kind: 'variation', game, map };
}
