import styles from '../PgnViewer.module.css';
import MoveText from '../utils/MoveText.jsx';
import { numberLabel, firstMoveLabelInVariation } from '../utils/pgnView.helpers.js';
function VariationLine({ line, onClick, renderSAN }) {
  if (!Array.isArray(line) || !line.length) return null;

  return (
    <>
      {line.map((m, i) => {
        console.log('variation line', m);
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
              <MoveText color={m?.enriched?.side} san={m?.enriched.san} />
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
  console.log('row view');

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
            <MoveText color={white?.enriched?.side} san={white?.enriched?.san} />
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
            <MoveText color={black?.enriched?.side} san={black?.enriched?.san} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RowVariation({ line, onClick, renderSAN }) {
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

export default function setTableView({ rows = [], onClick }) {
  return (
    <div className={styles.list}>
      {rows.map((r, i) => {
        if (r.kind === 'pair')
          return (
            <RowPair
              key={r.key}
              moveNo={r.moveNo}
              white={r.white}
              black={r.black}
              onClick={onClick}
            />
          );
        if (r.kind === 'comment') return <RowComment key={r.key} text={r.text} indent={r.indent} />;
        if (r.kind === 'variation') {
          const nextIsVf = rows[i + 1]?.kind === 'pair';
          const style = nextIsVf ? { borderBottom: '1px solid black' } : undefined;
          return (
            <div key={r.key} style={style}>
              <RowVariation line={r.line} onClick={onClick} />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
