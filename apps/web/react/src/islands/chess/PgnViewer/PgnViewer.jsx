// react/src/islands/chess/PgnViewer/PgnViewer.jsx
import { memo, useMemo, useCallback, useEffect } from "react";
import { flattenMoves } from "@meta/enrich-pgn";
import setTableView from "./views/Table.jsx";
import setLineView from "./views/Line.jsx";
import styles from "./PgnViewer.module.css";
// import MoveText from './utils/MoveText.jsx';

// Helper function to convert SAN notation to figurine notation

function PgnViewer({ enrichPgn, view = "grid", onClick, enrichedMove }) {
  //TODO : useCallback for onClick not to recreate it on each render if we have same move
  // useCallback(() => {
  //   if (prevMove.current && prevMove.current.enriched.id === m.enriched.id) {
  //     // کلیک مکربه برای انتخاب یک نقطه باقی ا��ت
  //     return;
  //   }
  // }, [enrichedMove]);
  const flatten = flattenMoves(enrichPgn);
  /** ساخت «ردیف‌ها» به‌صورت جفتی (white | black)
   *  - اگر white واریانت/کامنت داشته باشد: اول ردیف سفید، بعد واریانت‌ها، سپس ردیف سیاه.
   *  - در غیر این صورت: هر دو در یک ردیف.
   */

  const handleClickMove = useCallback(
    (m) => {
      onClick(m);
    },
    [onClick]
  );

  return (
    <>
      <div className={styles.viewer}>
        {enrichPgn?.gameComment && (
          <div className={styles.gameComment}>{enrichPgn.gameComment}</div>
        )}
        {view === "grid"
          ? setTableView({ flatten, onClick: handleClickMove, enrichedMove })
          : setLineView({ flatten, onClick: handleClickMove })}
      </div>
    </>
  );
}

export default memo(PgnViewer);
