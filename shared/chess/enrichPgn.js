// server/lib/chess/enrichPgn.cjs
const { parse } = require('@mliebelt/pgn-parser');
const { Chess } = require('chess.js');

const getSAN = (m) => m?.notation?.notation ?? m?.san ?? '';
const joinComment = (m) => [m?.commentMove, m?.commentAfter].filter(Boolean).join(' ').trim();

function enrichLine(moves = [], fenAtStart, path = 'm.') {
  const chess = new Chess(fenAtStart);
  const out = [];
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    const plyBefore = chess.history().length;
    const side = chess.turn();
    const moveNo = Math.floor(plyBefore / 2) + 1;

    const fenBefore = chess.fen();
    const san = getSAN(m);
    const res = chess.move(san, { sloppy: true });
    const fenAfter = chess.fen();

    const en = {
      path: `${path}${i}`,
      plyInLine: plyBefore + 1,
      moveNo,
      side,
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

    const vlines = Array.isArray(m?.variations) ? m.variations : [];
    if (vlines.length > 0) {
      en.variations = vlines.map((vMoves, rIdx) =>
        enrichLine(vMoves, fenBefore, `${path}${i}v${rIdx}.`),
      );
    }

    out.push(en);
  }
  return out;
}

function enrichPgn(pgnText = '') {
  let game = null;
  try {
    const games = parse(pgnText, { startRule: 'games' });
    if (!games || games.length === 0) {
      return { game: null, startFEN: 'startpos', enrichedMoves: [] };
    }
    game = games[0];
    const startFEN = game?.tags?.SetUp === '1' && game?.tags?.FEN ? game.tags.FEN : undefined;
    const enrichedMoves = enrichLine(game.moves || [], startFEN, 'm.');
    return { game, startFEN: startFEN || 'startpos', enrichedMoves };
  } catch (e) {
    return { game, startFEN: 'startpos', enrichedMoves: [], error: String(e?.message || e) };
  }
}

module.exports = { enrichPgn };
