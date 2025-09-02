// ESM module
import { parse } from '@mliebelt/pgn-parser';
import { Chess } from 'chess.js';

/**
 *
 * SAN را از آبجکت حرکت پارسر استخراج می‌کند (سازگار با نسخه‌های مختلف)
 */
const getSAN = (m) => m?.notation?.notation ?? m?.san ?? '';

/**
 * توضیحاتِ حرکت را کنار هم می‌چیند.
 */
const joinComment = (m) => [m?.commentMove, m?.commentAfter].filter(Boolean).join(' ').trim();

/**
 * اجرای یک خط (main یا variation) از FEN داده‌شده.
 * - هر حرکت روی chess.js اعمال می‌شود.
 * - روی هر نود پارسر، m.enriched ست می‌شود.
 * - برای هر variation از fenBefore همان حرکت، شاخهٔ جداگانه (بازگشتی) محاسبه می‌شود.
 *
 * @param {Array} moves - آرایهٔ حرکت‌ها در همان خط
 * @param {string|undefined} fenAtStart - FEN شروع این خط (undefined = startpos)
 * @param {string} path - مسیر یکتا برای دیباگ (m.0، m.1v0.2، ...)
 * @returns {Array} enriched line
 */
function enrichLine(moves = [], fenAtStart, path = 'm.') {
  const chess = new Chess(fenAtStart);

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];

    const plyBefore = chess.history().length; // تعداد نیم‌حرکت قبل از اجرای این حرکت
    const side = chess.turn(); // 'w' | 'b' (بازیکنی که الان بازی می‌کند)
    const moveNo = Math.floor(plyBefore / 2) + 1;

    const fenBefore = chess.fen();
    const san = getSAN(m);
    const res = chess.move(san, { sloppy: true }); // اجرای حرکت
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
      variations: undefined, // لیست خطوط enriched شاخه‌های این حرکت
    };

    // روی نودِ پارس‌شده هم بچسبان
    m.enriched = en;

    // شاخه‌ها در @mliebelt/pgn-parser داخل m.variations هستند
    const vlines = Array.isArray(m?.variations) ? m.variations : [];
    if (vlines.length > 0) {
      // هر شاخه از fenBefore همین حرکت شروع می‌شود
      en.variations = vlines.map((vMoves, rIdx) =>
        enrichLine(vMoves, fenBefore, `${path}${i}v${rIdx}.`),
      );
    }
  }
  return;
}

export function enrichPgn(pgnText = '') {
  let game = null;
  try {
    const games = parse(pgnText, { startRule: 'games' });
    if (!games || games.length === 0) {
      return { game: null, startFEN: 'startpos', enrichedMoves: [] };
    }
    game = games[0];

    // اگر از FEN شروع می‌کند (SetUp=1), همان را مبنا بگیر
    const startFEN = game?.tags?.SetUp === '1' && game?.tags?.FEN ? game.tags.FEN : undefined;

    enrichLine(game.moves || [], startFEN, 'm.');
    return game;
  } catch (e) {
    return {
      game,
      error: String(e?.message || e),
    };
  }
}
