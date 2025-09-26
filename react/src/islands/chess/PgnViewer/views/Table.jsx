import styles from './Table.module.css';
import clsx from 'clsx';
import MoveText from '../utils/MoveText.jsx';
import { numberLabel, firstMoveLabelInVariation } from '../utils/pgnView.helpers.js';

/**
 * Why: Rendering needs contiguous chunks of the same type to keep UI logic simple.
 * Purpose: Group a flattened move stream into consecutive 'main' vs 'var' fragments
 * so the table view can render rows (main) and inline branches (variants) predictably.
 * indexes are for creating the key only.
 */
function setFragments(flatten) {
  let fragments = [];
  let currentFragment = { kind: 'main', moves: [], startIndex: 0 };
  fragments.push(currentFragment);
  flatten.forEach((m, i) => {
    if (!m) return;
    if (m.flattened.isMainLine) {
      if (currentFragment.kind === 'main') {
        // قبلی هم اصلی بود
        currentFragment.moves.push(m);
        return;
      }
      // قبلی فرعی بود
      currentFragment.endIndex = i - 1;
      currentFragment = { kind: 'main', moves: [m], startIndex: i };
      fragments.push(currentFragment);
      return;
    }

    // حرکت فرعی است
    if (currentFragment.kind === 'var') {
      // قبلی هم فرعی بود
      currentFragment.moves.push(m);
      return;
    }
    // قبلی اصلی بود
    currentFragment.endIndex = i - 1;
    currentFragment = { kind: 'var', moves: [m], startIndex: i };
    fragments.push(currentFragment);
  });
  currentFragment.endIndex = currentFragment.moves.length - 1;
  return fragments[0].moves.length > 0 ? fragments : [];
}
const FilledMove = ({ move, onClick, moveBtnStyle, enrichedMove }) => {
  return (
    <div
      className={clsx(styles[moveBtnStyle || 'mainLineMoveBtn'], {
        [styles.activeMove]: enrichedMove?.enriched.id === move?.enriched?.id,
      })}
      onClick={() => onClick(move)}
      title={move?.enriched?.fenAfter || ''}
    >
      <MoveText move={move} />
    </div>
  );
};

// if we start with black
const emptyMove = () => <span className={styles.ellipsis}>…</span>;
export default function setTableView({ flatten, onClick, enrichedMove }) {
  let fragments = setFragments(flatten);

  function setMain(frag) {
    let rows = [];

    for (let i = 0; i < frag.moves.length; i++) {
      const move = frag.moves[i];
      let moveNumPart = <div className={styles.mainNum}>{move.enriched.moveNo}.&nbsp;</div>;
      let currMovePart = <FilledMove move={move} onClick={onClick} enrichedMove={enrichedMove} />;
      let whiteMovePart = null;
      let blackMovePart = null;
      if (i === 0 && move.enriched.side === 'b') {
        whiteMovePart = emptyMove();
        blackMovePart = currMovePart;
      } else if (i === frag.moves.length - 1 && move.enriched.side === 'w') {
        whiteMovePart = currMovePart;
        blackMovePart = emptyMove();
      } else {
        whiteMovePart = currMovePart;
        blackMovePart = (
          <FilledMove move={frag.moves[++i]} onClick={onClick} enrichedMove={enrichedMove} />
        );
      }
      rows.push(
        <div key={i} className={styles.row}>
          {moveNumPart}
          {whiteMovePart}
          {blackMovePart}
        </div>,
      );
    }
    return rows;
  }
  function setVariation(frag) {
    let parts = [];
    for (let i = 0; i < frag.moves.length; i++) {
      const move = frag.moves[i];
      let parenthesisBefore =
        move.flattened.isFirstMoveInLine && !move.flattened.isMainLine ? '(' : '';

      let parenthesisAfter =
        move.flattened.isLastMoveInLine && !move.flattened.isMainLine
          ? ')'.repeat(move.flattened.separatorEndCount)
          : '';

      let number = '';
      if (move.enriched.side === 'w') {
        number = `${move.enriched.moveNo}. `;
      } else if (
        move.flattened.isFirstMoveInLine ||
        move.flattened.prevPrintedMoveRef.enriched.line !== move.enriched.line
      ) {
        number = `${move.enriched.moveNo}. ... `;
      }

      parts.push(parenthesisBefore + number + ' ');
      parts.push(
        <FilledMove
          key={`varmove_${frag.startIndex}_${i}`}
          move={move}
          onClick={onClick}
          enrichedMove={enrichedMove}
          moveBtnStyle="variationMoveBtn"
        />,
      );
      parts.push(' ' + parenthesisAfter);
    }
    return parts;
  }
  return (
    <div className={styles.list}>
      {fragments.map((frag, i) => {
        if (!frag) return null;
        if (frag.kind === 'main') {
          return setMain(frag);
        }
        if (frag.kind === 'var') {
          return (
            <div key={`var_${frag.startIndex}`} className={styles.variation}>
              {setVariation(frag)}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
