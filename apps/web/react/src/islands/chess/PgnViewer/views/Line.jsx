/*line ------------------- /UI ------------------- */
import styles from '../PgnViewer.module.css';
import MoveText from '../utils/MoveText.jsx';
import { numberLabel, firstMoveLabelInVariation } from '../utils/pgnView.helpers.js';
function LineRowPair({ moveNo, white, black, onClick, renderSAN }) {
  return (
    <span className={styles.linearMainRow}>
      <span>{moveNo ? moveNo + '.' : '…'}</span>
      <span className={styles.linearMainRowMoves}>
        {white ? (
          <span onClick={() => onClick(white)} title={white?.enriched?.fenAfter || ''}>
            <MoveText color={white?.enriched?.side} san={white?.enriched?.san} />
          </span>
        ) : (
          <span>…</span>
        )}
      </span>
      <span>
        {black ? (
          <span
            className={styles.linearMainRowMoves}
            onClick={() => onClick(black)}
            title={black?.enriched?.fenAfter || ''}
          >
            <MoveText color={black?.enriched?.side} san={black?.enriched?.san} />
          </span>
        ) : null}
      </span>
    </span>
  );
}

function LineRowVariation({ line, onClick }) {
  return (
    <span className={styles.linearVariation}>
      (<LineVariationLine line={line} onClick={onClick} />)
    </span>
  );
}

function LineRowComment({ text, indent = 0 }) {
  if (!text) return null;
  return (
    <span className={styles.comment} style={{ marginInlineStart: indent }}>
      {text}
    </span>
  );
}
function LineVariationLine({ line, onClick }) {
  if (!Array.isArray(line) || !line.length) return null;
  return (
    <>
      {line.map((m, i) => {
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
              className={styles.linearVarMove}
              onClick={() => onClick(m)}
              title={m?.enriched?.fenAfter || ''}
            >
              <MoveText color={m?.enriched?.side} san={m?.enriched.san} />
            </span>
            {Array.isArray(m?.variations) && m.variations.length
              ? m.variations.map((sub, si) => (
                  <span key={`${key}_sub_${si}`} className={styles.paren}>
                    {' ('}
                    <LineVariationLine line={sub} onClick={onClick} />
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
export default function setLineView({ rows = [], onClick }) {
  return (
    <div className={styles.linearList}>
      {rows.map((r, i) => {
        if (r.kind === 'pair')
          return (
            <LineRowPair
              key={r.key}
              moveNo={r.moveNo}
              white={r.white}
              black={r.black}
              onClick={onClick}
            />
          );
        if (r.kind === 'comment')
          return <LineRowComment key={r.key} text={r.text} indent={r.indent} />;
        if (r.kind === 'variation') {
          const nextIsVf = rows[i + 1]?.kind === 'pair';
          const style = '' / nextIsVf ? { borderBottom: '1px solid black' } : undefined;
          return (
            <span key={r.key} style={style}>
              <LineRowVariation line={r.line} onClick={onClick} />
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}
