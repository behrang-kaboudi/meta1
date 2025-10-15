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
export { sanWithNags, numberLabel, firstMoveLabelInVariation, getComment, collectVariations };
